import { tutors, users } from "@/models";
import { isAdmin } from "@/lib/common";
import { forbidden, tutorNotFound, userNotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { sendUserVerificationEmail } from "@/lib/email";

async function create(req: Request.Default, res: Response) {
  const body = schema.http.tutor.create.body.parse(req.body);
  const tutor = await tutors.create(body);

  await sendUserVerificationEmail({
    userId: tutor.id,
    email: tutor.email,
    baseUrl: req.baseUrl,
  });

  res.status(200).send();
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const tutorId = schema.http.tutor.update.params.parse(req.params).id;
  const fields = schema.http.tutor.update.body.parse(req.body);
  const user = await users.findById(req.user.id);
  if (!user) return next(tutorNotFound());

  await tutors.update(tutorId, {
    ...fields,
    password: fields.password ? hashPassword(fields.password) : undefined,
  });

  res.status(200).send();
}

async function getOne(req: Request.Default, res: Response, next: NextFunction) {
  const id = schema.http.tutor.get.params.parse(req.params).id;
  const tutor = await tutors.findById(id);
  if (!tutor) return next(userNotFound());

  const owner = req.user.id === tutor.id;
  const admin = isAdmin(req.user.type);
  const examiner = req.user.type === IUser.Type.Examiner;
  const eligible = owner || admin || examiner;
  if (!eligible) return next(forbidden());

  res.status(200).json(tutor);
}

async function getTutors(req: Request.Default, res: Response) {
  const list = await tutors.findAll();
  res.status(200).json(list);
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.tutor.get.params.parse(req.params).id;
  const tutor = await tutors.findById(id);
  if (!tutor) return next(tutorNotFound());

  const owner = req.user.id === tutor.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden());

  await tutors.delete(id);
  res.status(200).send();
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(getOne),
  list: asyncHandler(getTutors),
  delete: asyncHandler(delete_),
};
