import {
  bad,
  busyTutorManager,
  exists,
  forbidden,
  inActiveTutorManager,
  notfound,
  unauthenticated,
} from "@/lib/error";
import {
  dateFilter,
  datetime,
  demoSessionStatus,
  id,
  ids,
  pageNumber,
  pageSize,
  sessionId,
} from "@/validation/utils";
import { IDemoSession, IIntroVideo } from "@litespace/types";
import {
  isRegularTutor,
  isTutor,
  isTutorManager,
  isAdmin,
  DEMO_SESSION_DURATION,
} from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  introVideos,
  tutors,
  availabilitySlots,
  demoSessions,
  knex,
  rooms,
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

const updateDemoSessionPayload: ZodSchema<IDemoSession.UpdateApiPayload> =
  zod.object({
    id: id,
    status: zod.nativeEnum(IDemoSession.Status),
  });

const findDemoSessionQuery: ZodSchema<IDemoSession.FindApiQuery> = zod.object({
  ids: zod.optional(ids),

  sessionIds: zod.optional(sessionId.array()),
  tutorIds: zod.optional(ids),
  slotIds: zod.optional(ids),
  tutorManagerIds: zod.optional(ids),
  statuses: demoSessionStatus.array().optional(),
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
  if (!isTutorManager(tutorManager)) return next(bad());
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

  // should not create more than one pending/passed demo-session
  const pendingDemoSession = first(
    (
      await demoSessions.find({
        tutorIds: [user.id],
        statuses: [IDemoSession.Status.Pending, IDemoSession.Status.Passed],
      })
    ).list
  );

  if (pendingDemoSession) return next(exists.demoSession());

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

  await knex.transaction(async (tx) => {
    await demoSessions.create(
      {
        tutorId: user.id,
        slotId,
        start,
      },
      tx
    );
    await rooms.create([user.id, slot.userId], tx);
  });
  res.sendStatus(200);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(unauthenticated());
  const allowed = isTutor(user) || isTutorManager(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id, status }: IDemoSession.UpdateApiPayload =
    updateDemoSessionPayload.parse(req.body);

  const demoSession = await demoSessions.findById(id);
  if (!demoSession) return next(notfound.demoSession());

  const session = {
    id: demoSession.id,
    tutorId: demoSession.tutorId,
    status: demoSession.status,
  };

  const isCanceled =
    session.status === IDemoSession.Status.CanceledByTutor ||
    session.status === IDemoSession.Status.CanceledByTutorManager ||
    session.status === IDemoSession.Status.CanceledByAdmin;
  if (isCanceled) return next(forbidden());

  if (isRegularTutor(user) && user.id !== session.tutorId)
    return next(forbidden());

  if (isRegularTutor(user) && status !== IDemoSession.Status.CanceledByTutor)
    return next(forbidden());

  if (isTutorManager(user)) {
    const allowedStatuses = [
      IDemoSession.Status.CanceledByTutorManager,
      IDemoSession.Status.Passed,
      IDemoSession.Status.Rejected,
    ];
    if (!allowedStatuses.includes(status)) return next(forbidden());

    // Verify the tutor manager owns the slot for this demo session
    const slot = await availabilitySlots.findById(demoSession.slotId);
    if (slot?.userId !== user.id) return next(forbidden());
  }

  await demoSessions.update({ ids: [id], status });

  res.sendStatus(200);
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(unauthenticated());
  const allowed = isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload = findDemoSessionQuery.parse(req.query);

  const response: IDemoSession.FindApiResponse = await demoSessions.find({
    ...payload,
    tutorIds: isRegularTutor(user) ? [user.id] : payload.tutorIds,
    tutorManagerIds: isTutorManager(user) ? [user.id] : payload.tutorManagerIds,
  });

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
  create: safeRequest(create),
  update: safeRequest(update),
};
