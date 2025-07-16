import {
  bad,
  busyTutorManager,
  forbidden,
  inActiveTutorManager,
  notfound,
  unauthenticated,
} from "@/lib/error";
import {
  dateFilter,
  datetime,
  id,
  ids,
  pageNumber,
  pageSize,
  sessionId,
} from "@/validation/utils";
import { IDemoSession, IIntroVideo } from "@litespace/types";
import {
  DEMO_SESSION_DURATION,
  isAdmin,
  isRegularTutor,
  isTutor,
  isTutorManager,
} from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  introVideos,
  tutors,
  availabilitySlots,
  demoSessions,
} from "@litespace/models";
import { first } from "lodash";
import zod, { ZodSchema } from "zod";
import dayjs from "@/lib/dayjs";
import { isBookable } from "@/lib/session";

const createDemoSessionPayload: ZodSchema<IDemoSession.CreateApiPayload> =
  zod.object({
    slotId: id,
    start: datetime,
  });

const findDemoSessionQuery: ZodSchema<IDemoSession.FindApiQuery> = zod.object({
  ids: zod.optional(ids),
  sessionIds: zod.optional(sessionId.array()),
  tutorIds: zod.optional(ids),
  slotIds: zod.optional(ids),
  tutorManagerIds: zod.optional(ids),
  statuses: zod.optional(zod.nativeEnum(IDemoSession.Status).array()),
  start: zod.optional(dateFilter),
  createdAt: zod.optional(dateFilter),
  updatedAt: zod.optional(dateFilter),
  page: pageNumber.optional().default(1),
  size: pageSize.optional().default(10),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(unauthenticated());
  const allowed = isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const { slotId, start }: IDemoSession.CreateApiPayload =
    createDemoSessionPayload.parse(req.body);

  const slot = await availabilitySlots.findById(slotId);
  if (!slot) return next(notfound.slot());

  const tutorManager = await tutors.findById(slot.userId);
  if (!tutorManager) return next(notfound.tutor());
  if (!isTutorManager(tutorManager)) return next(forbidden());
  if (!tutorManager.activated) return next(inActiveTutorManager());

  const approvedIntroVideo = await introVideos.find({
    tutorIds: [user.id],
    state: IIntroVideo.State.Approved,
  });

  if (!first(approvedIntroVideo?.list)) {
    return next(forbidden());
  }

  if (dayjs.utc(start).isBefore(dayjs.utc())) return next(bad());

  const slotStart = dayjs.utc(slot.start);
  const slotEnd = dayjs.utc(slot.end);
  const startTime = dayjs.utc(start);

  if (startTime.isBefore(slotStart) || startTime.isAfter(slotEnd)) {
    return next(bad());
  }

  if (
    !(await isBookable({
      slot,
      bookInfo: {
        start,
        duration: DEMO_SESSION_DURATION,
      },
    }))
  )
    return next(busyTutorManager());

  await demoSessions.create({
    tutorId: user.id,
    slotId,
    start,
  });

  res.sendStatus(200);
}

// @galal @TODO: implement this handler and ensure that its test suite passes.
async function update(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(unauthenticated());
  const allowed = isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload = findDemoSessionQuery.parse(req.query);

  // regular tutors are only allowed to retrieve their demo-sessions
  if (
    isRegularTutor(user) &&
    (!payload.tutorIds?.includes(user.id) || payload.tutorIds.length > 1)
  )
    return next(forbidden());

  // tutor-managers are only allowed to retrieve their demo-sessions
  if (
    isTutorManager(user) &&
    (!payload.tutorManagerIds?.includes(user.id) ||
      payload.tutorManagerIds.length > 1)
  )
    return next(forbidden());

  const response: IDemoSession.FindApiResponse =
    await demoSessions.find(payload);

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
  create: safeRequest(create),
  update: safeRequest(update),
};
