import { ratings, tutors, users } from "@/models";
import { IUser } from "@litespace/types";
import { alreadyRated, forbidden, notfound, ratingNotFound } from "@/lib/error";
import { Request, Response } from "express";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { isAdmin } from "@/lib/common";
import { identityObject } from "@/validation/utils";

async function create(req: Request, res: Response, next: NextFunction) {
  const raterId = req.user.id;
  const { rateeId, value, feedback } = schema.http.rating.create.body.parse(
    req.body
  );

  const exists = await users.exists(rateeId);
  if (!exists) return next(notfound());

  const rating = await ratings.findByEntities({
    rater: raterId,
    ratee: rateeId,
  });

  if (rating) return next(alreadyRated());

  const data = await ratings.create({
    raterId,
    rateeId,
    value,
    feedback: feedback || null,
  });

  res.status(200).json(data);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const data = schema.http.rating.update.body.parse(req.body);

  const rating = await ratings.findById(data.id);
  if (!rating) return next(ratingNotFound());
  if (rating.studentId !== req.user.id) return next(forbidden());

  await ratings.update(data);
  res.status(200).send();
}

async function delete_(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);

  const rating = await ratings.findById(id);
  if (!rating) return next(ratingNotFound());

  const owner = rating.studentId === req.user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden());

  await ratings.delete(id);
  res.status(200).send();
}

async function getUserRatings(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const list = await ratings.findTutorRatings(id);
  res.status(200).json(list);
}

async function getRatingById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const rating = await ratings.findById(id);
  if (!rating) return next(notfound());
  res.status(200).json(rating);
}

async function rateMediaProvider(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user.type !== IUser.Type.Tutor) return next(forbidden());

  const tutorId = req.user.id;
  const tutor = await tutors.findById(tutorId);
  if (!tutor) return next(notfound);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  getUserRatings: asyncHandler(getUserRatings),
  getRatingById: asyncHandler(getRatingById),
  delete: asyncHandler(delete_),
  rateMediaProvider: asyncHandler(rateMediaProvider),
};
