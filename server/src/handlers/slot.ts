import { calls, slots } from "@/models";
import { isAdmin } from "@/lib/common";
import { badRequest, forbidden, notfound } from "@/lib/error";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Time, unpackSlots } from "@litespace/sol";
import { id, identityObject, repeat } from "@/validation/utils";
import { enforceRequest } from "@/middleware/accessControl";
import dayjs from "@/lib/dayjs";
import zod from "zod";
import { ISlot } from "@litespace/types";

const findDiscreteTimeSlotsQuery = zod.object({
  start: zod.optional(zod.string().date()),
  window: zod.optional(zod.coerce.number()),
});

const createSlotPayload = zod.object({
  title: zod.string().trim().min(5).max(255),
  time: zod.object({ start: zod.string(), end: zod.string() }),
  date: zod.object({
    start: zod.string().date(),
    end: zod.optional(zod.string().date()),
  }),
  repeat,
});

const findDiscreteTimeSlotsParams = zod.object({ userId: id });

async function create(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const payload = createSlotPayload.parse(req.body);

  const start = Time.from(payload.time.start);
  const end = Time.from(payload.time.end);
  if (
    !start.isValid() ||
    !end.isValid() ||
    start.isSame(end) ||
    start.isAfter(end) ||
    end.isBefore(start)
  )
    return next(badRequest());

  const slot = await slots.create({
    userId: req.user.id,
    title: payload.title,
    time: payload.time,
    date: payload.date,
    repeat: payload.repeat,
    weekday: -1,
  });

  res.status(200).json(slot);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const fields = schema.http.slot.update.body.parse(req.body);
  const slotId = schema.http.slot.update.params.parse(req.params).id;
  const slot = await slots.findById(slotId);

  if (!slot) return next(notfound.slot());
  if (slot.userId !== req.user.id) return next(forbidden());

  await slots.update(slotId, fields);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const slot = await slots.findById(id);
  if (!slot) return next(notfound.slot());

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
  if (!slot) return next(notfound.slot());
  if (slot.userId !== req.user.id) return next(forbidden());
  await slots.delete(slot.id);
  res.status(200).send();
}

async function findDiscreteTimeSlots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { userId } = findDiscreteTimeSlotsParams.parse(req.params);
  const query: ISlot.SlotFilter = findDiscreteTimeSlotsQuery.parse(req.query);
  const window = query.window || 30;
  const start = query.start || dayjs.utc().format("YYYY-MM-DD");
  const end = dayjs.utc(start).add(window, "day").format("YYYY-MM-DD");
  const options = { start, end };

  const [slotsList, callsList] = await Promise.all([
    slots.findByUserId(userId),
    calls.findByHostId(userId, options),
  ]);

  const unpacked = unpackSlots(slotsList, callsList, {
    start: dayjs.utc(start),
    window,
  });
  res.status(200).json(unpacked);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  findById: asyncHandler(findById),
  findUserSlots: asyncHandler(findUserSlots),
  findMySlots: asyncHandler(findMySlots),
  delete: asyncHandler(deleteSlot),
  findDiscreteTimeSlots: asyncHandler(findDiscreteTimeSlots),
};
