import { forbidden, notfound } from "@/lib/error";
import { withdrawMethod } from "@/validation/utils";
import { authorizer } from "@litespace/auth";
import { withdrawMethods } from "@litespace/models";
import { IWithdrawMethod } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";

const number = zod.coerce.number().int().positive();

const createPayload = zod.object({
  type: withdrawMethod,
  min: number,
  max: number,
  enabled: zod.boolean(),
});

const updateParams = zod.object({ type: withdrawMethod });
const updatePayload = zod.object({
  min: zod.optional(number),
  max: zod.optional(number),
  enabled: zod.optional(zod.boolean()),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const allowed = authorizer().admin().check(req.user);
  if (!allowed) return next(forbidden());

  const payload: IWithdrawMethod.CreatePayload = createPayload.parse(req.body);
  const method = await withdrawMethods.create(payload);
  res.status(200).json(method);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const allowed = authorizer().admin().check(req.user);
  if (!allowed) return next(forbidden());

  const { type } = updateParams.parse(req.params);
  const payload = updatePayload.parse(req.body);

  const method = await withdrawMethods.findByType(type);
  if (!method) return next(notfound.base());

  await withdrawMethods.update(type, payload);
  res.status(200).json();
}

async function find(_req: Request, res: Response) {
  const methods = await withdrawMethods.find();
  res.status(200).json(methods);
}

export default {
  create: safe(create),
  update: safe(update),
  find: safe(find),
};
