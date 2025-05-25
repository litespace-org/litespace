import { forbidden, notfound } from "@/lib/error";
import { plans } from "@litespace/models";
import {
  boolean,
  dateFilter,
  id,
  numericFilter,
  pageNumber,
  pageSize,
  queryBoolean,
  withNamedId,
} from "@/validation/utils";
import { IPlan } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isRegularUser, isSuperAdmin, isUser } from "@litespace/utils/user";
import zod from "zod";

const number = zod.number().int().positive().gt(0);

const createPlanPayload = zod.object({
  weeklyMinutes: number,
  baseMonthlyPrice: number,
  monthDiscount: number,
  quarterDiscount: number,
  yearDiscount: number,
  forInvitesOnly: boolean,
  active: boolean,
});

const updatePlanPayload = zod.object({
  weeklyMinutes: zod.optional(number),
  baseMonthlyPrice: zod.optional(number),
  monthDiscount: zod.optional(number),
  quarterDiscount: zod.optional(number),
  yearDiscount: zod.optional(number),
  forInvitesOnly: zod.optional(boolean),
  active: zod.optional(boolean),
});

const findPlansQuery = zod.object({
  ids: id.array().optional().describe("fild plans by ids"),
  weeklyMinutes: numericFilter
    .optional()
    .describe("filter plans by weekly minutes"),
  baseMonthlyPrice: numericFilter
    .optional()
    .describe("filter plans by base monthly price"),
  monthDiscount: numericFilter
    .optional()
    .describe("filter plans by monthly discount"),
  quarterDiscount: numericFilter
    .optional()
    .describe("filter plans by quarter discount"),
  yearDiscount: numericFilter
    .optional()
    .describe("filter plans by year discount"),
  active: queryBoolean
    .optional()
    .describe("filter plans by whether they are active or not"),
  forInvitesOnly: queryBoolean
    .optional()
    .describe("filter plans by whether they are for invites only or not"),
  createdAt: dateFilter
    .optional()
    .describe("filter plans by their creation date"),
  updatedAt: dateFilter
    .optional()
    .describe("filter plans by their latest update date"),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const {
    weeklyMinutes,
    baseMonthlyPrice,
    monthDiscount,
    quarterDiscount,
    yearDiscount,
    forInvitesOnly,
    active,
  }: IPlan.CreateApiPayload = createPlanPayload.parse(req.body);

  const plan = await plans.create({
    weeklyMinutes,
    baseMonthlyPrice,
    monthDiscount,
    quarterDiscount,
    yearDiscount,
    forInvitesOnly,
    active,
  });

  res.status(200).json(plan);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const {
    weeklyMinutes,
    baseMonthlyPrice,
    monthDiscount,
    quarterDiscount,
    yearDiscount,
    forInvitesOnly,
    active,
  }: IPlan.UpdateApiPayload = updatePlanPayload.parse(req.body);

  const found = await plans.findById(id);
  if (!found) return next(notfound.plan());

  const plan = await plans.update(id, {
    weeklyMinutes,
    baseMonthlyPrice,
    monthDiscount,
    quarterDiscount,
    yearDiscount,
    forInvitesOnly,
    active,
  });

  res.status(200).json(plan);
}

async function deletePlan(req: Request, res: Response, next: NextFunction) {
  const allowed = isSuperAdmin(req.user);
  if (!allowed) return next(forbidden());
  const { id } = withNamedId("id").parse(req.params);

  const found = await plans.findById(id);
  if (!found) return next(notfound.plan());

  await plans.delete(id);
  res.status(200).send();
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const plan = await plans.findById(id);
  if (!plan) return next(notfound.plan());

  const publicPlan = plan.active && !plan.forInvitesOnly;
  if (isRegularUser(user) && !publicPlan) return next(forbidden());

  const response: IPlan.FindByIdApiResponse = plan;
  res.status(200).json(response);
}

async function find(req: Request, res: Response) {
  const query: IPlan.FindApiQuery = findPlansQuery.parse(req.query);
  const list = await plans.find(query);
  const response: IPlan.FindApiResponse = list;
  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  delete: safeRequest(deletePlan),
  findById: safeRequest(findById),
  find: safeRequest(find),
};
