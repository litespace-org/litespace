import { tutors, users } from "@/models";
import { IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import { badRequest, forbidden, notfound, userExists } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";
import {
  email,
  gender,
  identityObject,
  password,
  name,
  id,
} from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";
import { httpQueryFilter } from "@/validation/http";
import { count, knex } from "@/models/query";
import { sample } from "lodash";
import zod from "zod";
import { Knex } from "knex";

const updateUserPayload = zod.object({
  email: zod.optional(email),
  password: zod.optional(password),
  name: zod.optional(
    zod.object({ ar: zod.optional(name), en: zod.optional(name) })
  ),
  gender: zod.optional(gender),
  birthYear: zod.optional(zod.number().positive()),
  drop: zod.optional(
    zod.object({
      photo: zod.optional(zod.boolean()),
      video: zod.optional(zod.boolean()),
    })
  ),
  bio: zod.optional(zod.string().trim()),
  about: zod.optional(zod.string().trim()),
});

const findTutorMetaParams = zod.object({ tutorId: id });

export async function create(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { email, password, role } = schema.http.user.create.parse(req.body);

  const creatorRole = req.user?.role;
  const admin = isAdmin(creatorRole);
  const publicRole = [IUser.Role.Tutor, IUser.Role.Student].includes(role);
  if (!publicRole && !admin) return next(forbidden());

  const exists = await users.findByEmail(email);
  if (exists) return next(userExists());

  const user = await knex.transaction(async (tx) => {
    const user = await users.create(
      { role, email, password: hashPassword(password) },
      tx
    );

    if (role === IUser.Role.Tutor) await tutors.create(user.id, tx);
    return user;
  });

  const origin = req.get("origin");
  if (!origin) return next(badRequest());

  await sendUserVerificationEmail({
    userId: user.id,
    email: user.email,
    origin,
  });

  next(); // Next handler should be the "Local Auth" from passport.
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);

  const allowed = enforceRequest(req, id === req.user?.id);
  if (!allowed) return next(forbidden());

  const currentUser = req.user;
  const targetUser = await users.findById(id);
  if (!targetUser) return next(forbidden());

  const { email, name, password, gender, birthYear, drop, bio, about } =
    updateUserPayload.parse(req.body);

  const files = {
    image: {
      file: req.files?.[IUser.UpdateMediaFilesApiKeys.Photo],
      type: FileType.Image,
    },
    video: {
      file: req.files?.[IUser.UpdateMediaFilesApiKeys.Video],
      type: FileType.Video,
    },
  };

  // Only media provider can update tutor media files (images and videos)
  // Tutor cannot upload it for himself.
  const isUpdatingTutorMedia =
    (files.image.file || files.video.file) &&
    targetUser.role === IUser.Role.Tutor;
  const isEligibleUser = [
    IUser.Role.SuperAdmin,
    IUser.Role.RegularAdmin,
    IUser.Role.MediaProvider,
  ].includes(currentUser.role);
  if (isUpdatingTutorMedia && !isEligibleUser) return next(forbidden());

  // Only media providers can upload videos.
  // e.g., students/interviewers cannot try to upload videos
  if (files.video.file && !isEligibleUser) return next(forbidden());

  const [photo, video] = await Promise.all(
    [
      { file: req.files?.photo, type: FileType.Image },
      { file: req.files?.video, type: FileType.Video },
    ].map(({ file, type }) => (file ? uploadSingle(file, type) : undefined))
  );

  const user = await knex.transaction(async (tx: Knex.Transaction) => {
    const user = await users.update(
      id,
      {
        name,
        email,
        gender,
        birthYear,
        photo: drop?.photo === true ? null : photo,
        password: password ? hashPassword(password) : undefined,
      },
      tx
    );

    if (bio || about || video || drop?.video)
      await tutors.update(
        targetUser.id,
        { bio, about, video: drop?.video ? null : video },
        tx
      );

    return user;
  });

  res.status(200).json(user);
}

async function delete_(req: Request, res: Response) {
  const { id } = schema.http.user.delete.query.parse(req.query);
  await users.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const id = schema.http.user.findById.params.parse(req.params).id;
  const user = await users.findById(id);
  if (!user) return next(notfound.user());

  const owner = user.id === req.user.id;
  const admin = isAdmin(req.user.role);
  const interviewer = req.user.role === IUser.Role.Interviewer;
  const eligible = owner || admin || interviewer;
  if (!eligible) return next(forbidden());
  res.status(200).json(user);
}

async function findUsers(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const filter = httpQueryFilter<keyof IUser.Row>(
    users.columns.filterable,
    req.query
  );

  const [list, total] = await Promise.all([
    users.find(filter),
    count(users.table),
  ]);

  res.status(200).json({ list, total });
}

async function findMe(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  res.status(200).json(req.user);
}

async function returnUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(notfound.user());
  res.status(200).json(req.user);
}

async function selectInterviewer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const interviewers = await users.findManyBy("role", IUser.Role.Interviewer);
  const interviewer = sample(interviewers);
  if (!interviewer) return next(notfound.user());

  res.status(200).json(interviewer);
}

async function findTutorMeta(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { tutorId } = findTutorMetaParams.parse(req.params);
  const meta = await tutors.findSelfById(tutorId);
  if (!meta) return next(notfound.tutor());
  res.status(200).json(meta);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findUsers: asyncHandler(findUsers),
  findMe: asyncHandler(findMe),
  returnUser: asyncHandler(returnUser),
  selectInterviewer: asyncHandler(selectInterviewer),
  findTutorMeta: asyncHandler(findTutorMeta),
};
