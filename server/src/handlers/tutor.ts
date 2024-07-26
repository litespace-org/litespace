import { tutors, users } from "@/models";
import { isAdmin } from "@/lib/common";
import {
  badRequest,
  forbidden,
  notfound,
  tutorNotFound,
  userNotFound,
} from "@/lib/error";
import { Request, Response } from "express";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { sendUserVerificationEmail } from "@/lib/email";
import { uploadSingle } from "@/lib/media";
import { email, identityObject } from "@/validation/utils";
import { FileType } from "@/constants";

async function create(req: Request, res: Response, next: NextFunction) {
  const body = schema.http.tutor.create.body.parse(req.body);
  const tutor = await tutors.create(body);

  const origin = req.get("origin");
  if (!origin) return next(badRequest());

  await sendUserVerificationEmail({
    userId: tutor.id,
    email: tutor.email,
    origin,
  });

  res.status(200).send();
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const fields = schema.http.tutor.update.body.parse(req.body);
  const user = await users.findById(req.user.id);
  if (!user) return next(tutorNotFound());
  // if (user.type !== IUser.Type.Tutor) return next(badRequest());

  const [photo, video] = await Promise.all(
    [
      { file: req.files?.photo, type: FileType.Image },
      { file: req.files?.video, type: FileType.Video },
    ].map(({ file, type }) => (file ? uploadSingle(file, type) : undefined))
  );

  await tutors.update(id, {
    ...fields,
    photo,
    video,
    password: fields.password ? hashPassword(fields.password) : undefined,
  });

  res.status(200).send();
}

async function getOne(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const tutor = await tutors.findById(id);
  if (!tutor) return next(userNotFound());

  const owner = req.user.id === tutor.id;
  const admin = isAdmin(req.user.type);
  const interviewer = req.user.type === IUser.Type.Interviewer;
  const eligible = owner || admin || interviewer;
  if (!eligible) return next(forbidden());

  res.status(200).json(tutor);
}

async function getTutors(req: Request, res: Response) {
  const list = await tutors.findAll();
  res.status(200).json(list);
}

async function delete_(req: Request, res: Response, next: NextFunction) {
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

async function getTutorsMedia(req: Request, res: Response, next: NextFunction) {
  const list = await tutors.findTutorsMedia();
  res.status(200).json(list);
}

async function getTutorMediaById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = identityObject.parse(req.params);
  const media = await tutors.findTutorMediaById(id);
  if (!media) return next(notfound());
  res.status(200).json(media);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  get: asyncHandler(getOne),
  list: asyncHandler(getTutors),
  delete: asyncHandler(delete_),
  getTutorsMedia: asyncHandler(getTutorsMedia),
  getTutorMediaById: asyncHandler(getTutorMediaById),
};
