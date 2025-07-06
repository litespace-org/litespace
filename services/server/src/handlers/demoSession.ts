import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";
import { IDemoSession } from "@litespace/types";
import { availabilitySlots } from "@litespace/models";
import { demoSessions } from "@litespace/models/src/demoSessions";
import { id } from "@/validation/utils";
import { bad, forbidden, notfound } from "@/lib/error";
import {
  isAdmin,
  isTutorManager,
  isRegularTutor,
  isTutor,
} from "@litespace/utils/user";

const updatePayload: ZodSchema<IDemoSession.UpdateApiPayload> = zod.object({
  id,
  status: zod.nativeEnum(IDemoSession.Status),
});

async function create(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { id, status } = updatePayload.parse(req.body);
  const demoSession = await demoSessions.findById(id);
  if (!demoSession) return next(notfound.demoSession());

  const isCanceled =
    demoSession.status === IDemoSession.Status.CanceledByTutor ||
    demoSession.status === IDemoSession.Status.CanceledByTutorManager;
  if (isCanceled) return next(forbidden());

  // admin: can update any session with any status
  if (isAdmin(user)) {
    // no checks needed for admin
  } else if (isRegularTutor(user)) {
    if (status !== IDemoSession.Status.CanceledByTutor) {
      return next(forbidden());
    }
  } else if (isTutorManager(user)) {
    const slot = await availabilitySlots.findById(demoSession.slotId);
    if (!slot) return next(notfound.slot());
    if (slot.userId !== id) return next(forbidden());
    const allowedStatuses = [
      IDemoSession.Status.CanceledByTutorManager,
      IDemoSession.Status.Passed,
      IDemoSession.Status.Rejected,
    ];
    if (!allowedStatuses.includes(status)) return next(forbidden());
  }

  await demoSessions.update(id, { status });
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
