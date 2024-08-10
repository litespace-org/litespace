import { calls, slots } from "@/models";
import { isAdmin } from "@/lib/common";
import { forbidden, notfound, slotNotFound } from "@/lib/error";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { unpackSlots } from "@litespace/sol";
import { identityObject } from "@/validation/utils";
import { enforceRequest } from "@/middleware/accessControl";

async function create(req: Request, res: Response) {
  const slot = schema.http.slot.create.parse(req.body);

  await slots.create({
    ...slot,
    userId: req.user.id,
  });

  res.status(200).send();
}

async function update(req: Request, res: Response, next: NextFunction) {
  const fields = schema.http.slot.update.body.parse(req.body);
  const slotId = schema.http.slot.update.params.parse(req.params).id;
  const slot = await slots.findById(slotId);

  if (!slot) return next(slotNotFound());
  if (slot.userId !== req.user.id) return next(forbidden());

  await slots.update(slotId, fields);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const slot = await slots.findById(id);
  if (!slot) return next(notfound());

  const owner = req.user.id === slot.userId;
  const admin = isAdmin(req.user.role);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden());
  res.status(200).json(slot);
}

async function findUserSlots(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  const { id } = identityObject.parse(req.params);
  const list = await slots.findByUserId(id);
  res.status(200).json(list);
}

async function findMySlots(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  const list = await slots.findByUserId(req.user.id);
  res.status(200).json(list);
}

async function deleteSlot(req: Request, res: Response, next: NextFunction) {
  const id = schema.http.slot.delete.params.parse(req.params).id;
  const slot = await slots.findById(id);
  if (!slot) return next(slotNotFound());
  if (slot.userId !== req.user.id) return next(forbidden());
  await slots.delete(slot.id);
  res.status(200).send();
}

async function getDiscreteTimeSlots(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  const [slotsList, callsList] = await Promise.all([
    slots.findByUserId(id),
    calls.findByHostId(id),
  ]);
  const unpacked = unpackSlots(slotsList, callsList);
  res.status(200).json(unpacked);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  findById: asyncHandler(findById),
  findUserSlots: asyncHandler(findUserSlots),
  findMySlots: asyncHandler(findMySlots),
  delete: asyncHandler(deleteSlot),
  getDiscreteTimeSlots: asyncHandler(getDiscreteTimeSlots),
};
