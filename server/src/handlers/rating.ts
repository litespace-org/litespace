import { ratings, users } from "@/models";
import { alreadyRated, badRequest, forbidden, notfound } from "@/lib/error";
import { Request, Response } from "express";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { identityObject } from "@/validation/utils";
import { enforceRequest } from "@/middleware/accessControl";
import { IUser } from "@litespace/types";

const rateeRoles = [IUser.Type.Tutor, IUser.Type.MediaProvider];

async function createRating(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const raterId = req.user.id;
  const isTutor = req.user.type === IUser.Type.Tutor;
  const isStudent = req.user.type === IUser.Type.Student;
  const { rateeId, value, feedback } = schema.http.rating.create.body.parse(
    req.body
  );

  const ratee = await users.findById(rateeId);
  if (!ratee) return next(notfound());
  // Only "tutors" and "media providers" can be rated
  if (!rateeRoles.includes(ratee.type)) return next(badRequest());
  // Students can only rate tutors
  if (isStudent && ratee.type !== IUser.Type.Tutor) return next(badRequest());
  // Tutors can only rate media providers
  if (isTutor && ratee.type !== IUser.Type.MediaProvider)
    return next(badRequest());

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

async function updateRating(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const payload = schema.http.rating.update.body.parse(req.body);
  const rating = await ratings.findById(id);

  if (!rating) return next(notfound());
  if (rating.raterId !== req.user.id) return next(forbidden());

  await ratings.update(id, payload);
  res.status(200).send();
}

async function deleteRating(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);

  const rating = await ratings.findById(id);
  if (!rating) return next(notfound());

  const allowed = enforceRequest(req, rating.raterId === req.user.id);
  if (!allowed) return next(forbidden());

  await ratings.delete(id);
  res.status(200).send();
}

async function getRatings(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  const list = await ratings.findAll();
  res.status(200).json(list);
}

async function getRaterRatings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = identityObject.parse(req.params);
  const allowed = enforceRequest(req, id === req.user.id);
  if (!allowed) return next(forbidden());
  const list = await ratings.findByRaterId(id);
  res.status(200).json(list);
}

async function getRateeRatings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = identityObject.parse(req.params);
  const allowed = enforceRequest(req, id === req.user.id);
  if (!allowed) return next(forbidden());
  const list = await ratings.findByRateeId(id);
  res.status(200).json(list);
}

async function getRatingById(req: Request, res: Response, next: NextFunction) {
  const userId = req.user.id;
  const { id } = identityObject.parse(req.params);
  const rating = await ratings.findById(id);
  if (!rating) return next(notfound());
  const owner = rating.raterId === userId || rating.rateeId === userId;
  const allowed = enforceRequest(req, owner);
  if (!allowed) return next(forbidden());
  res.status(200).json(rating);
}

export default {
  createRating: asyncHandler(createRating),
  updateRating: asyncHandler(updateRating),
  getRatings: asyncHandler(getRatings),
  getRaterRatings: asyncHandler(getRaterRatings),
  getRateeRatings: asyncHandler(getRateeRatings),
  getRatingById: asyncHandler(getRatingById),
  deleteRating: asyncHandler(deleteRating),
};
