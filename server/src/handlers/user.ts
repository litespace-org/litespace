import { users } from "@/models";
import { IFilter, IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import {
  badRequest,
  forbidden,
  notfound,
  userAlreadyTyped,
  userExists,
  userNotFound,
} from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";
import { httpQueryFilter, identityObject } from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";

export async function create(req: Request, res: Response, next: NextFunction) {
  const { email, password, name, role } = schema.http.user.create.parse(
    req.body
  );

  const exists = await users.findByEmail(email);
  if (exists) return next(userExists());

  const user = await users.create({
    password: hashPassword(password),
    role,
    email,
    name,
  });

  const origin = req.get("origin");
  if (!origin) return next(badRequest());

  await sendUserVerificationEmail({
    userId: user.id,
    email: user.email,
    origin,
  });

  res.status(200).send();
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const { email, name, password, gender, role, birthYear } =
    schema.http.user.update.body.parse(req.body);

  if (role && req.user.role) return next(userAlreadyTyped());

  const photo = req.files?.photo
    ? await uploadSingle(req.files.photo, FileType.Image)
    : undefined;

  await users.update(id, {
    email,
    name,
    gender,
    photo,
    role,
    birthYear,
    password: password ? hashPassword(password) : undefined,
  });

  res.status(200).send();
}

async function delete_(req: Request, res: Response) {
  const { id } = schema.http.user.delete.query.parse(req.query);
  await users.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const id = schema.http.user.findById.params.parse(req.params).id;
  const user = await users.findById(id);
  if (!user) return next(userNotFound());

  const owner = user.id === req.user.id;
  const admin = isAdmin(req.user.role);
  const interviewer = req.user.role === IUser.Role.Interviewer;
  const eligible = owner || admin || interviewer;
  if (!eligible) return next(forbidden());
  res.status(200).json(user);
}

async function getMany(req: Request, res: Response, next: NextFunction) {
  const filter = httpQueryFilter<keyof IUser.Row>(["id", "email"], req.query);
  console.log({ filter });
  const list = await users.findAll();
  res.status(200).json(list);
}

async function findMe(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  res.status(200).json(req.user);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  getMany: asyncHandler(getMany),
  findMe: asyncHandler(findMe),
};
