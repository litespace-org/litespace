import { authorizationSecret } from "@/constants";
import { User, user } from "@/database";
import { isAdmin } from "@/lib/common";
import ResponseError, { Forbidden, UserNotFound } from "@/lib/error";
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
  await user.create(body);
  res.status(200).send();
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
  await user.update(body);
  res.status(200).send();
}

async function delete_(req: Request.Query<{ id: string }>, res: Response) {
  const id = schema.http.user.delete.query.parse(req.query).id;
  await user.delete(id);
  res.status(200).send();
}

async function getOne(
  req: Request.Query<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.user.get.query.parse(req.query).id;
  const info = await user.findOne(id);
  if (!info) return next(new UserNotFound());

  const owner = info.id === req.user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());
  res.status(200).json(info);
}

async function getMany(
  req: Request.Query<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  const users = await user.findAll();
  res.status(200).json(users);
}

async function login(req: Request.Default, res: Response, next: NextFunction) {
  const { email, password } = schema.http.user.login.body.parse(req.body);
  const info = await user.findByCredentials(email, password);
  if (!info) return next(new UserNotFound());

  const token = jwt.sign({ id: info.id }, authorizationSecret, {
    expiresIn: "7d",
  });

  res.status(200).json({
    user: info,
    token,
  });
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  getOne: asyncHandler(getOne),
  getMany: asyncHandler(getMany),
  login: asyncHandler(login),
};
