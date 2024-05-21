import { User, complex, tutors, users } from "@/database";
import { isAdmin } from "@/lib/common";
import { Forbidden, NotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { map, merge, omit } from "lodash";

async function create(req: Request.Default, res: Response) {
  const body = schema.http.tutor.create.body.parse(req.body);
  const now = new Date().toISOString();

  const id = await users.create({
    ...body,
    type: User.Type.Tutor,
    createdAt: now,
    updatedAt: now,
  });

  await tutors.create({
    id,
    bio: null,
    about: null,
    video: null,
    createdAt: now,
    updatedAt: now,
  });

  res.status(200).json({ id });
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const body = schema.http.tutor.update.body.parse(req.body);
  const user = await users.findOne(req.user.id);
  if (!user) return next(new NotFound());

  const fields = { ...body, id: req.user.id };
  await users.update(fields);
  await tutors.update(fields);
  res.status(200).send();
}

async function getOne(req: Request.Default, res: Response, next: NextFunction) {
  const id = schema.http.tutor.get.query.parse(req.query).id;

  const [user, tutor] = await Promise.all([
    users.findOne(id),
    tutors.findById(id),
  ]);
  if (!user || !tutor) return next(new NotFound());

  const owner = req.user.id === user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());

  const fullData = omit(merge(user, tutor), "password");
  res.status(200).json(fullData);
}

async function getMany(req: Request.Default, res: Response) {
  const list = await complex.getTutors();
  res.status(200).json(list);
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.tutor.get.query.parse(req.query).id;
  const user = await users.findOne(id);
  if (!user) return next(new NotFound());

  const owner = req.user.id === user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());

  await tutors.delete(id);
  await users.delete(id);

  res.status(200).send();
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(getOne),
  list: asyncHandler(getMany),
  delete: asyncHandler(delete_),
};
