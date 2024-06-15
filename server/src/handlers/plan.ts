import { notfound } from "@/lib/error";
import { plans } from "@/models";
import { schema } from "@/validation";
import { identityObject } from "@/validation/utils";
import { IPlan } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request, res: Response) {
  const payload: IPlan.CreateApiPayload = schema.http.plan.create.body.parse(
    req.body
  );
  await plans.create({ ...payload, createdBy: req.user.id });
  res.status(200).send();
}

async function update(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  const payload: IPlan.UpdateApiPayload = schema.http.plan.update.body.parse(
    req.body
  );
  await plans.update(id, { ...payload, updatedBy: req.user.id });
  res.status(200).send();
}

async function delete_(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  await plans.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const plan = await plans.findById(id);
  if (!plan) return next(notfound());
  res.status(200).json(plan);
}

async function findAll(req: Request, res: Response) {
  const list = await plans.findAll();
  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findAll: asyncHandler(findAll),
};
