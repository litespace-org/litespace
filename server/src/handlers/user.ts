import { User, user } from "@/database";
import ResponseError from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

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
  const id = schema.http.user.delete.params.parse(req.params).id;
  await user.delete(id);
  res.status(200).send();
}

async function get(
  req: Request.Query<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  const id = schema.http.user.get.query.parse(req.params).id;

  if (id) {
    const info = await user.findOne(id);
    // todo: throw error
    if (!info) return next(new ResponseError("User not found", 404));
    res.status(200).json(info);
    return;
  }

  const users = await user.findAll();
  res.status(200).json(users);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  get: asyncHandler(get),
};
