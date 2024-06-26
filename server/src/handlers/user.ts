import { tokens, users } from "@/models";
import { IUser } from "@litespace/types";
import { isAdmin } from "@/lib/common";
import {
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
import http from "@/validation/http";
import { randomBytes, sha256 } from "@/lib/crypto";
import dayjs from "@/lib/dayjs";
import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";

export async function create(req: Request, res: Response, next: NextFunction) {
  const { email, password, name, type } = schema.http.user.create.parse(
    req.body
  );

  const exists = await users.findByEmail(email);
  if (exists) return next(userExists());

  await users.create({
    password: hashPassword(password),
    type,
    email,
    name,
  });

  res.status(200).send();
}

async function update(req: Request, res: Response, next: NextFunction) {
  const { id, email, name, password, gender, birthday, type, avatar } =
    schema.http.user.update.body.parse(req.body);

  if (type && req.user.type) return next(userAlreadyTyped());

  await users.update(id, {
    email,
    name,
    gender,
    birthday,
    avatar,
    type,
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
  const admin = isAdmin(req.user.type);
  const examiner = req.user.type === IUser.Type.Examiner;
  const eligible = owner || admin || examiner;
  if (!eligible) return next(forbidden());
  res.status(200).json(user);
}

async function getMany(req: Request, res: Response, next: NextFunction) {
  const list = await users.findAll();
  res.status(200).json(list);
}

async function findMe(req: Request, res: Response) {
  res.status(200).json(req.user);
}

async function forgetPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = http.user.forgetPassword.body.parse(req.body);
  const user = await users.findByEmail(email);
  if (!user) return next(notfound());

  const token = randomBytes();
  const hash = sha256(token);
  const expiresAt = dayjs.utc().add(10, "minutes").toDate();

  await tokens.create({
    userId: user.id,
    hash,
    expiresAt,
  });

  await emailer.send({
    to: user.email,
    template: EmailTemplate.ForgetPassword,
    props: { url: `http://localhost:3001?token${token}` },
  });

  res.status(200).send();
}

async function resetPassword(req: Request, res: Response, next: NextFunction) {
  const payload = http.user.resetPassword.body.parse(req.body);
  const hash = sha256(payload.token);
  const token = await tokens.findByHash(hash);
  const expired = !!token && dayjs.utc(token.expiresAt).isAfter(dayjs.utc());
  if (!token || token.used || expired) return next(new Error("Invalid token"));

  await users.update(token.userId, {
    password: hashPassword(payload.password),
  });
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  getMany: asyncHandler(getMany),
  findMe: asyncHandler(findMe),
  forgetPassword: asyncHandler(forgetPassword),
};
