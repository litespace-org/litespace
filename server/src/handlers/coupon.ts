import { notfound } from "@/lib/error";
import { coupons } from "@/models";
import http from "@/validation/http";
import { identityObject } from "@/validation/utils";
import { ICoupon } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { merge } from "lodash";

async function create(req: Request, res: Response) {
  const payload: ICoupon.CreateApiPayload = http.coupon.create.body.parse(
    req.body
  );

  const coupon = await coupons.create(
    merge(payload, { createdBy: req.user.id })
  );

  res.status(200).json(coupon);
}

async function update(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  const payload: ICoupon.UpdateApiPayload = http.coupon.update.body.parse(
    req.body
  );

  const coupon = await coupons.update(
    id,
    merge(payload, { updatedBy: req.user.id })
  );

  res.status(200).json(coupon);
}

async function delete_(req: Request, res: Response) {
  const { id } = identityObject.parse(req.params);
  await coupons.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const coupon = await coupons.findById(id);
  if (!coupon) return next(notfound.coupon());
  res.status(200).json(coupon);
}

async function findByCode(req: Request, res: Response, next: NextFunction) {
  const { code } = http.coupon.findByCode.params.parse(req.params);
  const coupon = await coupons.findByCode(code);
  if (!coupon) return next(notfound.coupon());
  res.status(200).json(coupon);
}

async function findAll(req: Request, res: Response) {
  const list = await coupons.findAll();
  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  findById: asyncHandler(findById),
  findByCode: asyncHandler(findByCode),
  findAll: asyncHandler(findAll),
};
