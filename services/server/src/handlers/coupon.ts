import { forbidden, notfound } from "@/lib/error/api";
import { coupons } from "@litespace/models";
import {
  datetime,
  number,
  pagination,
  string,
  withNamedId,
} from "@/validation/utils";
import { ICoupon } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";
import { isAdmin } from "@litespace/utils/user";

const createCouponPayload: ZodSchema<ICoupon.CreateApiPayload> = zod.object({
  code: string,
  planId: number,
  fullMonthDiscount: number,
  fullQuarterDiscount: number,
  halfYearDiscount: number,
  fullYearDiscount: number,
  expiresAt: datetime,
});

const updateCouponPayload: ZodSchema<ICoupon.UpdateApiPayload> = zod.object({
  code: zod.optional(string),
  planId: zod.optional(number),
  fullMonthDiscount: zod.optional(number),
  fullQuarterDiscount: zod.optional(number),
  halfYearDiscount: zod.optional(number),
  fullYearDiscount: zod.optional(number),
  expiresAt: zod.optional(datetime),
});

const findByCodeParams = zod.object({
  code: string,
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const {
    code,
    expiresAt,
    fullMonthDiscount,
    fullQuarterDiscount,
    fullYearDiscount,
    halfYearDiscount,
    planId,
  }: ICoupon.CreateApiPayload = createCouponPayload.parse(req.body);

  const coupon = await coupons.create({
    createdBy: user.id,
    fullMonthDiscount,
    fullQuarterDiscount,
    fullYearDiscount,
    halfYearDiscount,
    expiresAt,
    planId,
    code,
  });

  res.status(200).json(coupon);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const {
    code,
    planId,
    expiresAt,
    fullMonthDiscount,
    fullQuarterDiscount,
    fullYearDiscount,
    halfYearDiscount,
  }: ICoupon.UpdateApiPayload = updateCouponPayload.parse(req.body);

  const coupon = await coupons.update(id, {
    code,
    planId,
    expiresAt,
    updatedBy: user.id,
    fullMonthDiscount,
    fullQuarterDiscount,
    fullYearDiscount,
    halfYearDiscount,
  });

  res.status(200).json(coupon);
}

async function delete_(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);
  await coupons.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = withNamedId("id").parse(req.params);
  const coupon = await coupons.findById(id);
  if (!coupon) return next(notfound.coupon());
  res.status(200).json(coupon);
}

async function findByCode(req: Request, res: Response, next: NextFunction) {
  const { code } = findByCodeParams.parse(req.params);
  const coupon = await coupons.findByCode(code);
  if (!coupon) return next(notfound.coupon());
  res.status(200).json(coupon);
}

async function findAll(req: Request, res: Response, next: NextFunction) {
  const allowed = isAdmin(req.user);
  if (!allowed) return next(forbidden());
  const query = pagination.parse(req.query);
  const list = await coupons.find(query);
  const response: ICoupon.FindCouponsApiResponse = list;
  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  delete: safeRequest(delete_),
  findById: safeRequest(findById),
  findByCode: safeRequest(findByCode),
  findAll: safeRequest(findAll),
};
