import { forbidden, notfound } from "@/lib/error";
import { plans } from "@litespace/models";
import {
  boolean,
  identityObject,
  pagination,
  string,
  withNamedId,
} from "@/validation/utils";
import { IPlan } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isSuperAdmin } from "@litespace/utils/user";
import zod from "zod";

const number = zod.number().int().positive().gt(0);

const createPlanPayload = zod.object({
  alias: string,
  weeklyMinutes: number,
  fullMonthPrice: number,
  fullQuarterPrice: number,
  halfYearPrice: number,
  fullYearPrice: number,
  fullMonthDiscount: number,
  fullQuarterDiscount: number,
  halfYearDiscount: number,
  fullYearDiscount: number,
  forInvitesOnly: boolean,
  active: boolean,
});

const updatePlanPayload = zod.object({
  weeklyMinutes: zod.optional(number),
  fullMonthPrice: zod.optional(number),
  fullQuarterPrice: zod.optional(number),
  halfYearPrice: zod.optional(number),
  fullYearPrice: zod.optional(number),
  fullMonthDiscount: zod.optional(number),
  fullQuarterDiscount: zod.optional(number),
  halfYearDiscount: zod.optional(number),
  fullYearDiscount: zod.optional(number),
  forInvitesOnly: zod.optional(boolean),
  active: zod.optional(boolean),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const {
    alias,
    weeklyMinutes,
    fullMonthPrice,
    fullQuarterPrice,
    halfYearPrice,
    fullYearPrice,
    fullMonthDiscount,
    fullQuarterDiscount,
    halfYearDiscount,
    fullYearDiscount,
    forInvitesOnly,
    active,
  }: IPlan.CreateApiPayload = createPlanPayload.parse(req.body);

  const plan = await plans.create({
    alias,
    weeklyMinutes,
    fullMonthPrice,
    fullQuarterPrice,
    halfYearPrice,
    fullYearPrice,
    fullMonthDiscount,
    fullQuarterDiscount,
    halfYearDiscount,
    fullYearDiscount,
    forInvitesOnly,
    active,
    createdBy: user.id,
  });

  res.status(200).json(plan);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const {
    alias,
    weeklyMinutes,
    fullMonthPrice,
    fullQuarterPrice,
    halfYearPrice,
    fullYearPrice,
    fullMonthDiscount,
    fullQuarterDiscount,
    halfYearDiscount,
    fullYearDiscount,
    forInvitesOnly,
    active,
  }: IPlan.UpdateApiPayload = updatePlanPayload.parse(req.body);

  const plan = await plans.update(id, {
    alias,
    weeklyMinutes,
    fullMonthPrice,
    fullQuarterPrice,
    halfYearPrice,
    fullYearPrice,
    fullMonthDiscount,
    fullQuarterDiscount,
    halfYearDiscount,
    fullYearDiscount,
    forInvitesOnly,
    active,
    updatedBy: user.id,
  });

  res.status(200).json(plan);
}

async function deletePlan(req: Request, res: Response, next: NextFunction) {
  const allowed = isSuperAdmin(req.user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);
  await plans.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const { id } = identityObject.parse(req.params);
  const plan = await plans.findById(id);
  // todo: only return public plans
  if (!plan) return next(notfound.plan());
  res.status(200).json(plan);
}

async function find(req: Request, res: Response) {
  const { page, size } = pagination.parse(req.query);
  const list = await plans.find({ page, size });
  const response: IPlan.FindPlansApiResponse = list;
  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  delete: safeRequest(deletePlan),
  findById: safeRequest(findById),
  find: safeRequest(find),
};
