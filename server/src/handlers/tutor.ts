import { complex, tutors, users } from "@/models";
import { isAdmin } from "@/lib/common";
import { forbidden, userNotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { merge, omit } from "lodash";
import { generateAuthorizationToken } from "@/lib/auth";

async function create(req: Request.Default, res: Response) {
  const body = schema.http.tutor.create.body.parse(req.body);
  const tutor = await tutors.create(body);
  res.status(200).json({ token: generateAuthorizationToken(tutor.id) });
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const body = schema.http.tutor.update.body.parse(req.body);
  const user = await users.findById(req.user.id);
  if (!user) return next(userNotFound);

  const fields = { ...body, id: req.user.id };
  await users.update(req.user.id, {});
  await tutors.update(fields);
  res.status(200).send();
}

async function getOne(req: Request.Default, res: Response, next: NextFunction) {
  const id = schema.http.tutor.get.query.parse(req.query).id;

  const [user, tutor] = await Promise.all([
    users.findById(id),
    tutors.findById(id),
  ]);
  if (!user || !tutor) return next(userNotFound);

  const owner = req.user.id === user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden);

  const fullData = omit(merge(user, tutor), "password");
  res.status(200).json(fullData);
}

async function getTutors(req: Request.Default, res: Response) {
  const list = await complex.findActivatedTutors();
  res.status(200).json(list);
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.tutor.get.query.parse(req.query).id;
  const user = await users.findById(id);
  if (!user) return next(userNotFound);

  const owner = req.user.id === user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden);

  await tutors.delete(id);
  await users.delete(id);

  res.status(200).send();
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(getOne),
  list: asyncHandler(getTutors),
  delete: asyncHandler(delete_),
};
