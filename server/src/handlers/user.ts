import { tutors, users } from "@/models";
import { IUser } from "@litespace/types";
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
import { identityObject } from "@/validation/utils";
import { uploadSingle } from "@/lib/media";
import { FileType } from "@/constants";
import { enforceRequest } from "@/middleware/accessControl";
import { httpQueryFilter } from "@/validation/http";
import { count, knex } from "@/models/query";

export async function create(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { email, password, name, role, birthYear } =
    schema.http.user.create.parse(req.body);

  const creatorRole = req.user?.role;
  const admin = isAdmin(creatorRole);
  const publicRole = [IUser.Role.Tutor, IUser.Role.Student].includes(role);
  if (!publicRole && !admin) return next(forbidden());

  const exists = await users.findByEmail(email);
  if (exists) return next(userExists());

  const user = await knex.transaction(async (tx) => {
    const user = await users.create(
      {
        role,
        email,
        name,
        birthYear,
        password: hashPassword(password),
      },
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
  const { email, name, password, gender, role, birthYear } =
    schema.http.user.update.body.parse(req.body);

  if (role && req.user.role) return next(userAlreadyTyped());

  const photo = req.files?.photo
    ? await uploadSingle(req.files.photo, FileType.Image)
    : undefined;

  await users.update(id, {
    email,
    // name,
    gender,
    photo,
    // role,
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
  if (!req.user) return next(notfound());
  res.status(200).json(req.user);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  getMany: asyncHandler(getMany),
  findMe: asyncHandler(findMe),
  returnUser: asyncHandler(returnUser),
};
