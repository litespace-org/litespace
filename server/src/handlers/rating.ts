import { User, ratings, tutors } from "@/models";
import ResponseError, { Forbidden, NotFound } from "@/lib/error";
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

  if (req.user.type !== User.Type.Student)
    return next(new ResponseError("Only students can rate tutors", 400));

  const tutor = await tutors.findById(tutorId);
  if (!tutor) return next(new NotFound("Tutor"));

  const rating = await ratings.findByEntities({
    tutorId,
    studentId,
  });

  if (rating)
    return next(new ResponseError("Student already rated this tutor", 400));

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
  if (!rating) return next(new NotFound("Rating"));
  if (rating.studentId !== req.user.id) return next(new Forbidden());

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
  if (!rating) return next(new NotFound("Rating"));

  const owner = rating.studentId === req.user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());

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
