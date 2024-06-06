import { zoomAccounts } from "@/models";
import { schema } from "@/validation";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request, res: Response) {
  const payload = schema.http.zoomAccount.create.body.parse(req.body);
  const account = await zoomAccounts.create(payload);
  res.status(200).json(account);
}

async function update(req: Request, res: Response) {
  const { id } = schema.http.zoomAccount.update.params.parse(req.params);
  const payload = schema.http.zoomAccount.update.body.parse(req.body);
  await zoomAccounts.update(id, payload);
  res.status(200).send();
}

async function delete_(req: Request, res: Response) {
  const { id } = schema.http.zoomAccount.update.params.parse(req.params);
  await zoomAccounts.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response) {
  const { id } = schema.http.zoomAccount.update.params.parse(req.params);
  const account = await zoomAccounts.findById(id);
  res.status(200).json(account);
}

async function findAll(req: Request, res: Response) {
  const accounts = await zoomAccounts.findAll();
  res.status(200).json(accounts);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findAll: asyncHandler(findAll),
};
