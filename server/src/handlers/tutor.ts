import { tutors, users } from "@/models";
import { isAdmin } from "@/lib/common";
import { badRequest, forbidden, notfound } from "@/lib/error";
import { Request, Response } from "express";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { IUser, NonEmptyList } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { sendUserVerificationEmail } from "@/lib/email";
import { uploadSingle } from "@/lib/media";
import { email, identityObject } from "@/validation/utils";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";
import { httpQueryFilter } from "@/validation/http";
import { count } from "@/models/query";

async function create(req: Request, res: Response, next: NextFunction) {
  // const body = schema.http.tutor.create.body.parse(req.body);
  // const tutor = await tutors.create();

  // const origin = req.get("origin");
  // if (!origin) return next(badRequest());

  // await sendUserVerificationEmail({
  //   userId: tutor.id,
  //   email: tutor.email,
  //   origin,
  // });

  res.status(200).send();
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const { dropPhoto, dropVideo, ...fields } =
    schema.http.tutor.update.body.parse(req.body);
  const user = await users.findById(req.user.id);
  if (!user) return next(notfound.user());

  const [photo, video] = await Promise.all(
    [
      { file: req.files?.photo, type: FileType.Image },
      { file: req.files?.video, type: FileType.Video },
    ].map(({ file, type }) => (file ? uploadSingle(file, type) : undefined))
  );

  await tutors.update(id, {
    ...fields,
    video: dropVideo ? null : video,
  });

  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const tutor = await tutors.findById(id);
  if (!tutor) return next(notfound.tutor());

  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  res.status(200).json(tutor);
}

async function getTutors(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const filter = httpQueryFilter(
    tutors.columns.fullTutorFields.filterable as NonEmptyList<string>,
    req.query
  );

  const [list, total] = await Promise.all([
    tutors.find(filter),
    count(tutors.table),
  ]);

  res.status(200).json({ list, total });
}

async function delete_(req: Request, res: Response, next: NextFunction) {
  const id = schema.http.tutor.get.params.parse(req.params).id;
  const tutor = await tutors.findById(id);
  if (!tutor) return next(notfound.tutor());

  const owner = req.user.id === tutor.id;
  const admin = isAdmin(req.user.role);
  const eligible = owner || admin;
  if (!eligible) return next(forbidden());

  await tutors.delete(id);
  res.status(200).send();
}

async function getTutorsMedia(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const filter = httpQueryFilter(
    tutors.columns.tutorMediaFields.filterable as NonEmptyList<string>,
    req.query
  );

  const [list, total] = await Promise.all([
    tutors.findTutorsMedia(filter),
    count(tutors.table),
  ]);

  res.status(200).json({ list, total });
}

async function getTutorMediaById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = identityObject.parse(req.params);
  const media = await tutors.findTutorMediaById(id);
  if (!media) return next(notfound.tutor());
  res.status(200).json(media);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  findById: asyncHandler(findById),
  list: asyncHandler(getTutors),
  delete: asyncHandler(delete_),
  getTutorsMedia: asyncHandler(getTutorsMedia),
  getTutorMediaById: asyncHandler(getTutorMediaById),
};
