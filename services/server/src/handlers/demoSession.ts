import {
  bad,
  busyTutorManager,
  forbidden,
  inActiveTutorManager,
  notfound,
  unauthenticated,
} from "@/lib/error";
import { datetime, id } from "@/validation/utils";
import { IDemoSession, IIntroVideo } from "@litespace/types";
import {
  DEMO_SESSION_DURATION,
  isRegularTutor,
  isTutorManager,
} from "@litespace/utils";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { introVideos, tutors, availabilitySlots } from "@litespace/models";
import { first } from "lodash";
import Zod from "zod";
import dayjs from "@/lib/dayjs";
import { isBookable } from "@/lib/session";

const createDemoSessionPayload = Zod.object({
  slotId: id,
  start: datetime,
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

  res.sendStatus(200);
}

// @galal @TODO: implement this handler and ensure that its test suite passes.
async function update(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

// @mk @TODO: implement this handler and ensure that its test suite passes.
async function find(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

export default {
  find: safeRequest(find),
  create: safeRequest(create),
  update: safeRequest(update),
};
