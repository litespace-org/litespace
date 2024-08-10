import { calls, slots, tutors } from "@/models";
import { ICall, IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import { forbidden, tutorHasNoTime, notfound } from "@/lib/error";
import { hasEnoughTime } from "@/lib/lessons";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { enforceRequest } from "@/middleware/accessControl";

async function createCall(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { slotId, start, duration, type } = schema.http.call.create.body.parse(
    req.body
  );

  const slot = await slots.findById(slotId);
  if (!slot) return next(notfound.slot());

  const host = await tutors.findById(slot.userId);
  if (!host) return next(notfound.user());

  const bookedCalls = await calls.findBySlotId(slotId);
  const enough = hasEnoughTime({
    call: { start, duration },
    calls: bookedCalls,
    slot,
  });
  if (!enough) return next(tutorHasNoTime());

  const call = await calls.create({
    type,
    hostId: host.id,
    attendeeId: req.user.id,
    slotId,
    start,
    duration,
  });

  res.status(200).json(call);
}

async function deleteCall(req: Request, res: Response, next: NextFunction) {
  const { id } = schema.http.call.delete.params.parse(req.params);
  const call = await calls.findById(id);
  if (!call) return next(notfound.call());

  const userId = req.user.id;
  const owner = userId === call.hostId || userId === call.attendeeId;
  const eligible = owner || isAdmin(req.user.role);
  if (!eligible) return next(forbidden());

  await calls.delete(id);
  res.status(200).send();
}

async function getCalls(user: IUser.Self): Promise<ICall.Self[]> {
  const id = user.id;
  const role = user.role;
  const studnet = role === IUser.Role.Student;
  const tutor = role === IUser.Role.Tutor;
  const interviewer = role === IUser.Role.Interviewer;
  if (studnet) return await calls.findByAttendeeId(id);
  if (tutor || interviewer) return await calls.findByHostId(id);
  return await calls.findAll(); // admin
}

async function getMany(req: Request, res: Response, next: NextFunction) {
  const calls = await getCalls(req.user);
  res.status(200).json(calls);
}

async function getOne(req: Request, res: Response, next: NextFunction) {
  const { id } = schema.http.call.get.params.parse(req.params);
  const call = await calls.findById(id);
  if (!call) return next(notfound.call());
  res.status(200).json(call);
}

async function findHostCalls(req: Request, res: Response) {
  const { id } = schema.http.call.get.params.parse(req.params);
  const hostCalls = await calls.findHostCalls(id);
  res.status(200).json(hostCalls);
}

async function findHostCallById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = schema.http.call.get.params.parse(req.params);
  const hostCall = await calls.findHostCallById(id);
  if (!hostCall) return next(notfound.call());
  res.status(200).json(hostCall);
}

export default {
  create: asyncHandler(createCall),
  delete: asyncHandler(deleteCall),
  get: asyncHandler(getOne),
  list: asyncHandler(getMany),
  findHostCalls: asyncHandler(findHostCalls),
  findHostCallById: asyncHandler(findHostCallById),
};
