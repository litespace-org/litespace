import { authorizationSecret } from "@/constants";
import { User, users } from "@/database";
import { isAdmin } from "@/lib/common";
import { Forbidden, NotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

async function create(
  req: Request.Body<Exclude<User.Self, "id">>,
  res: Response
) {
  const body = schema.http.user.create.parse(req.body);
  const now = new Date().toISOString();
  const id = await users.create({
    ...body,
    type: User.Type.Student,
    createdAt: now,
    updatedAt: now,
  });
  res.status(200).json({ id });
}

async function update(
  req: Request.Body<{
    id: number;
    email?: string;
    password?: string;
    name?: string;
    avatar?: string;
  }>,
  res: Response
) {
  const body = schema.http.user.update.body.parse(req.body);
  await users.update(body);
  res.status(200).send();
}

async function delete_(req: Request.Query<{ id: string }>, res: Response) {
  const id = schema.http.user.delete.query.parse(req.query).id;
  await users.delete(id);
  res.status(200).send();
}

async function getOne(
  req: Request.Query<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.user.get.query.parse(req.query).id;
  const user = await users.findOne(id);
  if (!user) return next(new NotFound());

  const owner = user.id === req.user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());
  res.status(200).json(user);
}

async function getMany(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const list = await users.findAll();
  res.status(200).json(list);
}

async function login(req: Request.Default, res: Response, next: NextFunction) {
  const { email, password } = schema.http.user.login.body.parse(req.body);
  const user = await users.findByCredentials(email, password);
  if (!user) return next(new NotFound());

  const token = jwt.sign({ id: user.id }, authorizationSecret, {
    expiresIn: "7d",
  });

  res.status(200).json({ user, token });
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  getOne: asyncHandler(getOne),
  getMany: asyncHandler(getMany),
  login: asyncHandler(login),
};
