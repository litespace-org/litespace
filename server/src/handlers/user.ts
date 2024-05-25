import { authorizationSecret } from "@/constants";
import { users } from "@/models";
import { isAdmin } from "@/lib/common";
import { Forbidden, NotFound } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

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

  await users.update({
    ...body,
    password: body.password ? hashPassword(body.password) : undefined,
  });

  res.status(200).send();
}

async function delete_(req: Request.Query<{ id: string }>, res: Response) {
  const { id } = schema.http.user.delete.query.parse(req.query);
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
  const user = await users.findByCredentials(email, hashPassword(password));
  if (!user) return next(new NotFound());

  const token = jwt.sign({ id: user.id }, authorizationSecret, {
    expiresIn: "7d",
  });

  res.status(200).json({ user, token });
}

export default {
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  getOne: asyncHandler(getOne),
  getMany: asyncHandler(getMany),
  login: asyncHandler(login),
};
