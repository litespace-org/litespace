import {
  forbidden,
  notfound,
  phoneRequired,
  unexpected,
} from "@/lib/error/api";
import { plans, planInvites } from "@litespace/models";
import {
  boolean,
  dateFilter,
  id,
  url,
  numericFilter,
  pageNumber,
  pageSize,
  queryBoolean,
  withNamedId,
  unionOfLiterals,
  planPeriod,
} from "@/validation/utils";
import { IFawry, IPlan } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  isAdmin,
  isRegularUser,
  isStudent,
  isSuperAdmin,
  isUser,
} from "@litespace/utils/user";
import zod, { ZodSchema } from "zod";
import { price } from "@litespace/utils";
import { calculatePlanPrice } from "@/lib/plan";
import { createPaidPlanTx } from "@/lib/transaction";
import { fawry } from "@/fawry/api";
import { encodeMerchantRefNumber } from "@/fawry/lib/ids";
import { TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD } from "@/fawry/constants";

const number = zod.number().int().positive().gt(0);
const discount = zod.number().int().gte(0);

const checkoutPayload: ZodSchema<IPlan.CheckoutPayload> = zod.object({
  planId: id,
  period: planPeriod,
  returnUrl: url,
  paymentMethod: unionOfLiterals<IFawry.PaymentMethod>([
    "CARD",
    "MWALLET",
    "PAYATFAWRY",
    "Mobile Wallet",
  ]),
  saveCardInfo: boolean.optional(),
  authCaptureModePayment: boolean.optional(),
});

const createPlanPayload: ZodSchema<IPlan.CreateApiPayload> = zod.object({
  weeklyMinutes: number,
  baseMonthlyPrice: number,
  monthDiscount: discount,
  quarterDiscount: discount,
  yearDiscount: discount,
  forInvitesOnly: boolean,
  active: boolean,
});

const updatePlanPayload: ZodSchema<IPlan.UpdateApiPayload> = zod.object({
  weeklyMinutes: zod.optional(number),
  baseMonthlyPrice: zod.optional(number),
  monthDiscount: zod.optional(discount),
  quarterDiscount: zod.optional(discount),
  yearDiscount: zod.optional(discount),
  forInvitesOnly: zod.optional(boolean),
  active: zod.optional(boolean),
});

const findPlansQuery: ZodSchema<IPlan.FindApiQuery> = zod.object({
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
  if (!plan || !plan.active) return next(notfound.plan());

  if (plan.forInvitesOnly && isRegularUser(user)) {
    const { total: invited } = await planInvites.find({
      planIds: [plan.id],
      userIds: [user.id],
    });
    if (!invited) return next(forbidden());
  }

  const response: IPlan.FindByIdApiResponse = plan;
  res.status(200).json(response);
}

async function find(req: Request, res: Response) {
  const query: IPlan.FindApiQuery = findPlansQuery.parse(req.query);
  const list = await plans.find(query);
  const response: IPlan.FindApiResponse = list;
  res.status(200).json(response);
}

async function checkout(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());
  if (!user.phone) return next(phoneRequired());

  const payload = checkoutPayload.parse(req.body);

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  if (plan.forInvitesOnly) {
    const { total: invited } = await planInvites.find({
      planIds: [plan.id],
      userIds: [user.id],
    });
    if (!invited) return next(forbidden());
  }

  const period = payload.period;
  const planPrice = calculatePlanPrice({ period, plan });

  const transaction = await createPaidPlanTx({
    userId: user.id,
    phone: user.phone,
    amount: planPrice,
    paymentMethod:
      TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD[payload.paymentMethod],
    planId: plan.id,
    planPeriod: period,
  });

  const result = await fawry.initExpressCheckout({
    merchantRefNum: encodeMerchantRefNumber({
      transactionId: transaction.id,
      createdAt: transaction.createdAt,
    }),
    amount: price.unscale(planPrice),
    customer: {
      id: user.id,
      name: user.name || "",
      phone: user.phone,
      email: user.email,
    },
    paymentMethod: payload.paymentMethod,
    returnUrl: payload.returnUrl,
    saveCardInfo: payload.saveCardInfo,
    authCaptureModePayment: payload.authCaptureModePayment,
  });
  if (result instanceof Error) return next(result);
  if (typeof result !== "string") return next(unexpected());

  const response: IFawry.InitExpressCheckoutResponse = result;
  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  update: safeRequest(update),
  delete: safeRequest(deletePlan),
  findById: safeRequest(findById),
  find: safeRequest(find),
  checkout: safeRequest(checkout),
};
