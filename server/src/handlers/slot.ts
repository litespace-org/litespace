import { slots } from "@/database";
import { isAdmin } from "@/lib/common";
import { Forbidden, NotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request.Default, res: Response) {
  const slot = schema.http.slot.create.parse(req.body);
  const now = new Date();

  await slots.create({
    ...slot,
    teacherId: req.user.id,
    createdAt: now.toUTCString(),
    updatedAt: now.toUTCString(),
  });

  res.status(200).send();
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const fields = schema.http.slot.update.parse(req.body);
  const slot = await slots.findById(fields.id);

  if (!slot) return next(new NotFound());
  if (slot.teacherId !== req.user.id) return next(new Forbidden());

  await slots.update(fields);
  res.status(200).send();
}

async function getOne(req: Request.Default, res: Response, next: NextFunction) {
  const id = schema.http.slot.get.query.parse(req.query).id;
  const slot = await slots.findById(id);
  if (!slot) return next(new NotFound());

  const owner = req.user.id === slot.teacherId;
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
  const list = await slots.findByTeacher(req.user.id);
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
  if (slot.teacherId !== req.user.id) return next(new Forbidden());
  await slots.delete(slot.id);
  res.status(200).send();
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(getOne),
  list: asyncHandler(getMany),
  delete: asyncHandler(delete_),
};
