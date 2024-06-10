import { ratings, tutors } from "@/models";
import { IUser } from "@litespace/types";
import {
  alreadyRated,
  forbidden,
  ratingNotFound,
  tutorNotFound,
} from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import dayjs from "@/lib/dayjs";
import { isAdmin } from "@/lib/common";

async function create(req: Request.Default, res: Response, next: NextFunction) {
  const studentId = req.user.id;
  const { tutorId, value, note } = schema.http.rating.create.body.parse(
    req.body
  );

  if (req.user.type !== IUser.Type.Student) return next(forbidden());

  const tutor = await tutors.findById(tutorId);
  if (!tutor) return next(tutorNotFound());

  const rating = await ratings.findByEntities({
    tutorId,
    studentId,
  });

  if (rating) return next(alreadyRated());

  const now = dayjs().utc().toISOString();
  const id = await ratings.create({
    tutorId,
    studentId,
    note: note || null,
    value,
    createdAt: now,
    updatedAt: now,
  });

  res.status(200).json({ id });
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const data = schema.http.rating.update.body.parse(req.body);

  const rating = await ratings.findById(data.id);
  if (!rating) return next(ratingNotFound());
  if (rating.studentId !== req.user.id) return next(forbidden());

  await ratings.update(data);
  res.status(200).send();
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const { id } = schema.http.rating.delete.query.parse(req.query);

  const rating = await ratings.findById(id);
  if (!rating) return next(ratingNotFound());

  const owner = rating.studentId === req.user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden());

  await ratings.delete(id);
  res.status(200).send();
}

async function get(req: Request.Default, res: Response, next: NextFunction) {
  const { tutorId } = schema.http.rating.get.query.parse(req.query);
  const list = await ratings.findTutorRatings(tutorId);
  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(get),
  delete: asyncHandler(delete_),
};
