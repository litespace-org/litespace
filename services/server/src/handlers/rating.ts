import { ratings, tutors, users } from "@litespace/models";
import { exists, forbidden, notfound } from "@/lib/error";
import { Request, Response } from "express";
import { NextFunction } from "express";
import safeRequest from "express-async-handler";
import {
  id,
  number,
  pagination,
  rating,
  string,
  withNamedId,
} from "@/validation/utils";
import { IRating, IUser } from "@litespace/types";
import {
  isAdmin,
  isMediaProvider,
  isStudent,
  isTutor,
  isUser,
} from "@litespace/auth";
import zod from "zod";

const createRatingPayload = zod.object({
  rateeId: id,
  value: rating,
  feedback: zod.optional(string),
});

const updateRatingPayload = zod.object({
  value: zod.optional(rating),
  feedback: zod.optional(string),
});

const findTutorRatingsQuery = zod.object({ 
  page: zod.optional(number), 
  size: zod.optional(number) 
});

async function createRating(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { rateeId, value, feedback } = createRatingPayload.parse(req.body);
  const ratee = await users.findById(rateeId);
  if (!ratee) return next(notfound.rating());

  const eligible =
    (isStudent(user) && isTutor(ratee)) ||
    (isTutor(user) && isMediaProvider(ratee));
  if (eligible) return next(forbidden());

  const rating = await ratings.findByEntities({
    rater: user.id,
    ratee: rateeId,
  });

  if (rating) return next(exists.rate());

  const data = await ratings.create({
    raterId: user.id,
    rateeId,
    value,
    feedback: feedback || null,
  });

  res.status(200).json(data);
}

async function updateRating(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const payload = updateRatingPayload.parse(req.body);
  const rating = await ratings.findSelfById(id);
  if (!rating) return next(notfound.rating());

  const eligible = user.id === rating.raterId || isAdmin(user);
  if (!eligible) return next(forbidden());

  await ratings.update(id, payload);
  res.status(200).send();
}

async function deleteRating(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const rating = await ratings.findSelfById(id);
  if (!rating) return next(notfound.rating());

  const eligible = user.id === rating.raterId || isAdmin(user);
  if (!eligible) return next(forbidden());

  await ratings.delete(id);
  res.status(200).send();
}

async function findRatings(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const result = await ratings.find(query);
  const response: IRating.FindRatingsApiResponse = result;
  res.status(200).json(response);
}

async function findRaterRatings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { id } = withNamedId("id").parse(req.params);
  const allowed = (isUser(user) && user.id === id) || isAdmin(user);
  if (!allowed) return next(forbidden());
  const result = await ratings.findByRaterId(id);
  const response: IRating.FindRaterRatingsApiResponse = result;
  res.status(200).json(response);
}

async function findRateeRatings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = withNamedId("id").parse(req.params);
  const user = req.user;
  const ratee = await users.findById(id);
  if (!ratee) return next(notfound.user());

  const eligible = isTutor(ratee) || (isMediaProvider(ratee) && isAdmin(user));
  if (!eligible) return next(forbidden());

  const result = await ratings.findByRateeId(id);
  const response: IRating.FindRateeRatingsApiResponse = result;
  res.status(200).json(response);
}

/**
  * Responds with a paginated list of a tutor ratings. 
  * This handler is pulbic, any one can get its response.
  */
async function findTutorRatings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const { page, size } = findTutorRatingsQuery.parse(req.query);

  const tutor = await tutors.findById(id);
  if (!tutor) return next(notfound.tutor());


  const result = await ratings.findOrderedTutorRatings(id, { page, size });

  const userRating = await ratings.findByRaterAndRateeIds(user.id, id);
  result.list = result.list.filter(rating => rating.userId !== user.id);
  if (userRating) result.list.unshift(userRating);

  res.status(200).json(result);
}

async function findRatingById(req: Request, res: Response, next: NextFunction) {
  const { id } = withNamedId("id").parse(req.params);
  const user = req.user;

  const rating = await ratings.findById(id);
  if (!rating) return next(notfound.rating());

  const allowed =
    (isUser(user) && user.id === rating.rater.id) || isAdmin(user);
  if (!allowed) return next(forbidden());
  res.status(200).json(rating);
}

export default {
  createRating: safeRequest(createRating),
  updateRating: safeRequest(updateRating),
  findRatings: safeRequest(findRatings),
  findRaterRatings: safeRequest(findRaterRatings),
  findRateeRatings: safeRequest(findRateeRatings),
  findTutorRatings: safeRequest(findTutorRatings),
  findRatingById: safeRequest(findRatingById),
  deleteRating: safeRequest(deleteRating),
};
