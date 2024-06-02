import { users } from "@/models";
import { isAdmin } from "@/lib/common";
import { Forbidden, NotFound } from "@/lib/error";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { generateAuthorizationToken } from "@/lib/auth";

export async function create(req: Request, res: Response) {
  const { email, password, name, type } = schema.http.user.create.parse(
    req.body
  );

  const user = await users.create({
    password: hashPassword(password),
    type,
    email,
    name,
  });

  res.status(200).json({ user, token: generateAuthorizationToken(user.id) });
}

async function update(req: Request, res: Response) {
  const body = schema.http.user.update.body.parse(req.body);

  await users.update({
    ...body,
    password: body.password ? hashPassword(body.password) : undefined,
  });

  res.status(200).send();
}

async function delete_(req: Request, res: Response) {
  const { id } = schema.http.user.delete.query.parse(req.query);
  await users.delete(id);
  res.status(200).send();
}

async function getOne(req: Request, res: Response, next: NextFunction) {
  const id = schema.http.user.get.query.parse(req.query).id;
  const user = await users.findById(id);
  if (!user) return next(new NotFound());

  const owner = user.id === req.user.id;
  const admin = isAdmin(req.user.type);
  const eligible = owner || admin;
  if (!eligible) return next(new Forbidden());
  res.status(200).json(user);
}

async function getMany(req: Request, res: Response, next: NextFunction) {
  const list = await users.findAll();
  res.status(200).json(list);
}

async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = schema.http.user.login.body.parse(req.body);
  const user = await users.findByCredentials(email, hashPassword(password));
  if (!user) return next(new NotFound("User"));
  res.status(200).json({ user, token: generateAuthorizationToken(user.id) });
}

async function findMe(req: Request, res: Response) {
  res.status(200).json(req.user);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  getOne: asyncHandler(getOne),
  getMany: asyncHandler(getMany),
  login: asyncHandler(login),
  findMe: asyncHandler(findMe),
};
