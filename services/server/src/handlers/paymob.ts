import { IPaymob, ITransaction } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  bad,
  forbidden,
  invalidUserName,
  notfound,
  phoneRequired,
} from "@/lib/error";
import { plans, subscriptions, transactions } from "@litespace/models";
import zod, { ZodSchema } from "zod";
import { id, planPeriod } from "@/validation/utils";
import {
  dayjs,
  isStudent,
  PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL,
  PLAN_PERIOD_TO_WEEK_COUNT,
} from "@litespace/utils";
import { calculatePlanPrice } from "@/lib/plan";
import { getCheckoutPageUrl, paymentMethodToIntegration } from "@/lib/paymob";
import { cashier } from "@/lib/cashier";

const createCheckoutUrlPayload: ZodSchema<IPaymob.CreateCheckoutUrlApiPayload> =
  zod.object({
    planId: id,
    planPeriod: planPeriod,
    paymentMethod: zod.union([
      zod.literal(ITransaction.PaymentMethod.Card),
      zod.literal(ITransaction.PaymentMethod.EWallet),
    ]),
  });

/**
 * Creates a client_secret and respond to the client with an HTTPS url
 * from which he/she can proceed the payment.
 */
async function createCheckoutUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const { planId, planPeriod, paymentMethod } = createCheckoutUrlPayload.parse(
    req.body
  );

  // the user must have specified at least his first and middle names.
  if (!user.name || user.name.split(" ").length < 2)
    return next(invalidUserName());

  // the user must have provided his phone number.
  if (!user.phone) return next(phoneRequired());

  // ensure that the plan do exist
  const plan = await plans.findById(planId);
  if (!plan) return next(notfound.plan());

  // create payment transaction
  const tx = await transactions.create({
    userId: user.id,
    planId,
    planPeriod,
    paymentMethod,
    amount: calculatePlanPrice({
      plan,
      period: planPeriod,
    }).total,
    providerRefNum: null,
  });

  // get payment integration id from the method
  const integrationId = paymentMethodToIntegration(paymentMethod);
  if (!integrationId) return next(bad());

  // craft the payment info
  const paymentInfo: IPaymob.PaymentInfo = {
    paymentMethods: [integrationId],
    specialReference: tx.id.toString(),

    items: [
      {
        name: `plan-${planId}-${PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL[planPeriod]}`,
        amount: tx.amount * 100,
        description: `Pay ${tx.amount * 100}EGP every ${PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL[planPeriod]}`,
        quantity: 1,
      },
    ],

    billingData: {
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1],
      phoneNumber: user.phone,
      email: user.email,
    },
  };

  // create the client_secret from paymob intention api
  const clientSecret = await cashier.paymob.createClientSecret(paymentInfo);

  // create then respond with the url
  const response: IPaymob.CreateCheckoutUrlApiResponse = {
    checkoutUrl: getCheckoutPageUrl(clientSecret),
  };

  res.status(200).json(response);
}

/**
 * This handler should be assigned in each paymob payment integration
 * as its transaction callback.
 */
async function onCheckout(req: Request, res: Response, next: NextFunction) {
  const payload: IPaymob.WebhookResponse = req.body;

  const transaction = await transactions.findById(
    Number(payload.intention.special_reference)
  );
  if (!transaction) return next(notfound.transaction());

  const plan = await plans.findById(transaction.planId);
  if (!plan) return next(notfound.plan());

  if (payload.transaction.success) {
    transactions.update(transaction.id, { status: ITransaction.Status.Paid });

    const weekCount = PLAN_PERIOD_TO_WEEK_COUNT[transaction.planPeriod];

    const start =
      dayjs.utc(payload.transaction.created_at).startOf("day") ||
      dayjs.utc().startOf("day");

    const end = start.add(weekCount, "week");

    await subscriptions.create({
      txId: transaction.id,
      period: transaction.planPeriod,
      planId: transaction.planId,
      weeklyMinutes: plan.weeklyMinutes,
      userId: transaction.userId,
      start: start.toISOString(),
      end: end.toISOString(),
    });
  } else if (payload.transaction.is_refunded)
    transactions.update(transaction.id, {
      status: ITransaction.Status.Refunded,
    });
  else if (transaction.status === ITransaction.Status.New)
    transactions.update(transaction.id, {
      status: ITransaction.Status.Processed,
    });

  res.sendStatus(200);
}

export default {
  createCheckoutUrl: safeRequest(createCheckoutUrl),
  onCheckout: safeRequest(onCheckout),
};
