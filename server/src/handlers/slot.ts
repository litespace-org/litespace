import { lessons, slots } from "@/database";
import { isAdmin } from "@/lib/common";
import { Forbidden, NotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import dayjs from "@/lib/dayjs";
import { asTimeValues, setDayTime, unpackSlots } from "@/lib/slots";

async function create(req: Request.Default, res: Response) {
  const slot = schema.http.slot.create.parse(req.body);
  const now = dayjs().toISOString();

  await slots.create({
    ...slot,
    tutorId: req.user.id,
    createdAt: now,
    updatedAt: now,
  });

  res.status(200).send();
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const fields = schema.http.slot.update.parse(req.body);
  const slot = await slots.findById(fields.id);

  if (!slot) return next(new NotFound());
  if (slot.tutorId !== req.user.id) return next(new Forbidden());

  await slots.update(fields);
  res.status(200).send();
}

async function getOne(req: Request.Default, res: Response, next: NextFunction) {
  const id = schema.http.slot.get.query.parse(req.query).id;
  const slot = await slots.findById(id);
  if (!slot) return next(new NotFound());

  const owner = req.user.id === slot.tutorId;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());
  res.status(200).json(slot);
}

async function getMany(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const list = await slots.findByTutor(req.user.id);
  res.status(200).json(list);
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.slot.get.query.parse(req.query).id;
  const slot = await slots.findById(id);
  if (!slot) return next(new NotFound());
  if (slot.tutorId !== req.user.id) return next(new Forbidden());
  await slots.delete(slot.id);
  res.status(200).send();
}

async function getDiscreteTimeSlots(req: Request.Default, res: Response) {
  const { tutorId } = schema.http.slot.getDiscreteTimeSlots.query.parse(
    req.query
  );

  const slotsList = await slots.findByTutor(tutorId);
  const lessonsList = await lessons.findByTutuorId(tutorId);

  // unpack slots to represent tutor schedule in the next two weeks
  // todo: move extend dayjs to a shared file
  unpackSlots(slotsList, lessonsList);
  // const today = setDayTime(dayjs().utc(), { hours: 0, minutes: 0, seconds: 0 });

  // for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
  //   const slot = slotsList[0];
  //   const start = asTimeValues(slot.time.start);
  //   const end = asTimeValues(slot.time.end);
  //   const day = today.add(dayIndex, "day");
  //   const exactStartTime = setDayTime(day, start);
  //   const exactEndTime = setDayTime(day, end);

  //   console.log({
  //     start: exactStartTime.toISOString(),
  //     end: exactEndTime.toISOString(),
  //   });
  // }

  res.status(200).json({ slotsList, lessonsList });
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(getOne),
  list: asyncHandler(getMany),
  delete: asyncHandler(delete_),
  getDiscreteTimeSlots: asyncHandler(getDiscreteTimeSlots),
};
