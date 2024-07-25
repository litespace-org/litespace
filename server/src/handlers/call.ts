import { calls, slots, tutors } from "@/models";
import { ICall, IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import {
  callNotFound,
  forbidden,
  slotNotFound,
  tutorHasNoTime,
  tutorNotFound,
} from "@/lib/error";
import { hasEnoughTime } from "@/lib/lessons";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import zod from "zod";

async function create(req: Request, res: Response, next: NextFunction) {
  const { slotId, start, size, type } = schema.http.call.create.body.parse(
    req.body
  );
  // validation
  // - validate empty slot
  // - validate start and duration
  // - validate user subscription
  // - update user remaining minutes
  // - no lessons at this time.
  if (req.user.type !== IUser.Type.Student) return next(forbidden());

  const slot = await slots.findById(slotId);
  if (!slot) return next(slotNotFound());

  const host = await tutors.findById(slot.userId);
  if (!host) return next(tutorNotFound());

  const bookedCalls = await calls.findBySlotId(slotId);
  const duration = zod.coerce.number().parse(size);
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

async function delete_(req: Request, res: Response, next: NextFunction) {
  const { id } = schema.http.call.delete.params.parse(req.params);
  const call = await calls.findById(id);
  if (!call) return next(callNotFound());

  const userId = req.user.id;
  const owner = userId === call.hostId || userId === call.attendeeId;
  const eligible = owner || isAdmin(req.user.type);
  if (!eligible) return next(forbidden());

  await calls.delete(id);
  res.status(200).send();
}

async function getCalls(user: IUser.Self): Promise<ICall.Self[]> {
  const id = user.id;
  const type = user.type;
  const studnet = type === IUser.Type.Student;
  const tutor = type === IUser.Type.Tutor;
  const interviewer = type === IUser.Type.Interviewer;

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
  if (!call) return next(callNotFound());
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
  if (!hostCall) return next(callNotFound());
  res.status(200).json(hostCall);
}

export default {
  create: asyncHandler(create),
  delete: asyncHandler(delete_),
  get: asyncHandler(getOne),
  list: asyncHandler(getMany),
  findHostCalls: asyncHandler(findHostCalls),
  findHostCallById: asyncHandler(findHostCallById),
};
