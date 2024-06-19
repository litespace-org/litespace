import { notfound } from "@/lib/error";
import { coupons, invites } from "@/models";
import http from "@/validation/http";
import { identityObject } from "@/validation/utils";
import { ICoupon, IInvite } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { merge } from "lodash";

async function create(req: Request, res: Response) {
  const payload: IInvite.CreateApiPayload = http.invite.create.body.parse(
    req.body
  );

  const invite = await invites.create(
    merge(payload, { createdBy: req.user.id })
  );

  res.status(200).json(invite);
}

async function update(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  const payload: IInvite.UpdateApiPayload = http.invite.update.body.parse(
    req.body
  );

  const invite = await invites.update(
    id,
    merge(payload, { updatedBy: req.user.id })
  );

  res.status(200).json(invite);
}

async function delete_(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  await invites.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const coupon = await invites.findById(id);
  if (!coupon) return next(notfound());
  res.status(200).json(coupon);
}

async function findAll(req: Request, res: Response) {
  const list = await invites.findAll();
  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findAll: asyncHandler(findAll),
};
