import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";

import {
  isAdmin,
  isRegularUser,
  isStudent,
  PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD,
  PLAN_PERIOD_TO_MONTH_COUNT,
  PLAN_PERIOD_TO_WEEK_COUNT,
  price,
  safePromise,
} from "@litespace/utils";
import { IFawry, IPlan, ITransaction, Wss } from "@litespace/types";

import { fawry } from "@/fawry/api";
import { bad, fawryError, forbidden, notfound } from "@/lib/error";
import { forgeFawryPayload } from "@/lib/fawry";
import { genSignature } from "@/fawry/lib";
import { fawryConfig } from "@/constants";
import { id, unionOfLiterals } from "@/validation/utils";
import dayjs from "@/lib/dayjs";
import {
  FAWRY_API_URL_CURRENT,
  FAWRY_ROUTES,
  TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD,
  ORDER_STATUS_TO_TRANSACTION_STATUS,
} from "@/fawry/constants";
import { clientRouter } from "@/lib/client";
import { Web } from "@litespace/utils/routes";
import {
  knex,
  plans,
  subscriptions,
  transactions,
  users,
} from "@litespace/models";
import { ApiContext } from "@/types/api";
import { OrderStatus, PaymentMethod } from "@/fawry/types/ancillaries";
import { asUserRoomId } from "@/wss/utils";
import {
  decodeMerchantRefNumber,
  encodeMerchantRefNumber,
} from "@/fawry/lib/ids";
import { calculatePlanPrice } from "@/lib/plan";
import { selectPhone } from "@/lib/user";
import { FawryStatusEnum, FawryStatusMap } from "@/fawry/types/errors";
import { first } from "lodash";

const planPeroid = unionOfLiterals<IPlan.PeriodLiteral>([
  "month",
  "quarter",
  "year",
]);

const payWithCardPayload: ZodSchema<IFawry.PayWithCardPayload> = zod.object({
  planId: id,
  cardToken: zod.string(),
  period: planPeroid,
  cvv: zod.string().length(3),
  phone: zod.string().optional(),
});

const payWithRefNumPayload: ZodSchema<IFawry.PayWithRefNumPayload> = zod.object(
  {
    planId: id,
    period: planPeroid,
    phone: zod.string().optional(),
  }
);

const payWithEWalletPayload: ZodSchema<IFawry.PayWithEWalletPayload> =
  zod.object({
    planId: id,
    period: planPeroid,
    wallet: zod.string(),
    phone: zod.string().optional(),
  });

const payWithBankInstallmentsPayload: ZodSchema<IFawry.PayWithBankInstallmentsPayload> =
  zod.object({
    planId: zod.number(),
    amount: zod.number(),
    cardToken: zod.string(),
    cvv: zod.number(),
    returnUrl: zod.string(),
  });

const cancelUnpaidOrderPayload: ZodSchema<IFawry.CancelUnpaidOrderPayload> =
  zod.object({
    transactionId: id,
  });

const syncPaymentPayload: ZodSchema<IFawry.SyncPaymentStatusPayload> =
  zod.object({ transactionId: id });

const refundPayload: ZodSchema<IFawry.RefundPayload> = zod.object({
  orderRefNum: zod.string(),
  refundAmount: zod.number(),
  reason: zod.string().optional(),
});

const findCardTokensQuery: ZodSchema<IFawry.FindCardTokensApiQuery> =
  zod.object({
    userId: id,
  });

const deleteCardTokenPayload: ZodSchema<IFawry.DeleteCardTokenPayload> =
  zod.object({
    cardToken: zod.string(),
    userId: id,
  });

const getPaymentStatusPayload: ZodSchema<IFawry.GetPaymentStatusPayload> =
  zod.object({
    transactionId: id,
  });

const setPaymentStatusPayload = zod.object({
  requestId: zod.string(),
  fawryRefNumber: zod.string(),
  merchantRefNumber: zod.string(),
  customerName: zod.string().optional(),
  customerMobile: zod.string().optional(),
  customerMail: zod.string().optional(),
  customerMerchantId: zod.string(),
  paymentAmount: zod.number(),
  orderAmount: zod.number(),
  fawryFees: zod.number(),
  orderStatus: unionOfLiterals<OrderStatus>([
    "NEW",
    "PAID",
    "CANCELED",
    "REFUNDED",
    "EXPIRED",
    "PARTIAL_REFUNDED",
    "FAILED",
  ]),
  paymentMethod: unionOfLiterals<PaymentMethod>([
    "CARD",
    "MWALLET",
    "PAYATFAWRY",
    "Mobile Wallet",
  ]),
  paymentTime: zod.number().optional(),
  paymentRefrenceNumber: zod.string().optional(),
  messageSignature: zod.string(),
  failureErrorCode: zod.coerce.number().optional(),
  failureReason: zod.string().optional(),
});

async function payWithCard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithCardPayload = payWithCardPayload.parse(req.body);

  const { valid, phone, update } = selectPhone(user.phone, payload.phone);
  if (!valid || !phone) return next(bad("Invalid or missing phone number"));
  // update user phone if needed.
  if (update) await users.update(user.id, { phone });

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  const period = PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[payload.period];
  const { total, totalScaled } = calculatePlanPrice({ period, plan });

  const transaction = await transactions.create({
    userId: user.id,
    providerRefNum: null,
    planId: plan.id,
    planPeriod: period,
    amount: totalScaled,
    paymentMethod: ITransaction.PaymentMethod.Card,
  });

  const result = await fawry.payWithCard({
    customer: {
      id: user.id,
      email: user.email,
      name: user.name || "LiteSpace Student",
      phone,
    },
    merchantRefNum: encodeMerchantRefNumber({
      transactionId: transaction.id,
      createdAt: transaction.createdAt,
    }),
    amount: total,
    cardToken: payload.cardToken,
    cvv: payload.cvv,
  });

  if (result.statusCode !== 200) {
    await transactions.update(transaction.id, {
      status: ITransaction.Status.Failed,
    });
    return next(fawryError(result.statusDescription));
  }

  await transactions.update(transaction.id, {
    status: ITransaction.Status.Processed,
  });

  const response: IFawry.PayWithCardResponse = {
    transactionId: transaction.id,
    redirectUrl: result.nextAction.redirectUrl,
  };

  res.json(response);
}

async function payWithRefNum(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithRefNumPayload = payWithRefNumPayload.parse(
    req.body
  );

  const { valid, phone, update } = selectPhone(user.phone, payload.phone);
  if (!valid || !phone) return next(bad("Invalid or missing phone number"));
  // update user phone if needed.
  if (update) await users.update(user.id, { phone });

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  const period = PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[payload.period];
  const { total, totalScaled } = calculatePlanPrice({ period, plan });

  const transaction = await transactions.create({
    userId: user.id,
    providerRefNum: null,
    planId: plan.id,
    planPeriod: period,
    amount: totalScaled,
    paymentMethod: ITransaction.PaymentMethod.Fawry,
  });

  const merchantRefNumber = encodeMerchantRefNumber({
    transactionId: transaction.id,
    createdAt: transaction.createdAt,
  });

  const { referenceNumber, statusCode, statusDescription } =
    await fawry.payWithRefNum({
      amount: total,
      customer: {
        id: user.id,
        email: user.email,
        name: user.name || "LiteSpace Student",
        phone,
      },
      merchantRefNum: merchantRefNumber,
    });

  if (statusCode !== 200 || !referenceNumber) {
    await transactions.update(transaction.id, {
      status: ITransaction.Status.Failed,
    });
    return next(fawryError(statusDescription));
  }

  await transactions.update(transaction.id, {
    status: ITransaction.Status.Processed,
    providerRefNum: Number(referenceNumber),
  });

  const response: IFawry.PayWithRefNumResponse = {
    transactionId: transaction.id,
    referenceNumber: Number(referenceNumber),
  };

  res.json(response);
}

async function payWithEWallet(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithEWalletPayload = payWithEWalletPayload.parse(
    req.body
  );

  const { valid, phone, update } = selectPhone(user.phone, payload.phone);
  if (!valid || !phone) return next(bad("Invalid or missing phone number"));
  // update user phone if needed.
  if (update) await users.update(user.id, { phone });

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  const period = PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[payload.period];
  const { total, totalScaled } = calculatePlanPrice({ period, plan });

  const transaction = await transactions.create({
    userId: user.id,
    providerRefNum: null,
    planId: plan.id,
    planPeriod: period,
    amount: totalScaled,
    paymentMethod: ITransaction.PaymentMethod.EWallet,
  });

  const merchantRefNumber = encodeMerchantRefNumber({
    transactionId: transaction.id,
    createdAt: transaction.createdAt,
  });

  const payment = await fawry.payWithEWallet({
    merchantRefNum: merchantRefNumber,
    amount: total,
    customer: {
      id: user.id,
      email: user.email,
      name: user.name || "LiteSpace Student",
      phone,
    },
  });

  if (payment.statusCode !== 200) {
    await transactions.update(transaction.id, {
      status: ITransaction.Status.Failed,
    });
    return next(fawryError(payment.statusDescription));
  }

  await transactions.update(transaction.id, {
    status: ITransaction.Status.Processed,
  });

  const response: IFawry.PayWithEWalletResponse = {
    transactionId: transaction.id,
    referenceNumber: payment.referenceNumber,
    walletQr: payment.walletQr || null,
  };

  res.status(200).json(response);
}

async function payWithBankInstallments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = payWithBankInstallmentsPayload.parse(req.body);

  // TODO: store transaction in the database
  const txId = Math.floor(Math.random() * 1000); // TODO: get transaction id from the db
  const forgedPayload = forgeFawryPayload({
    merchantRefNum: txId,
    paymentMethod: "CARD",
    amount: payload.amount,
    customer: {
      id: user.id,
      phone: user.phone || "",
      email: user.email,
      name: user.name || undefined,
    },
    signature: genSignature.forPayWithBankInstallment({
      merchantRefNum: txId,
      amount: payload.amount,
      cvv: payload.cvv.toString(),
      cardToken: payload.cardToken,
      customerProfileId: user.id,
      installmentPlanId: 1,
    }),
    description: "Pay LiteSpace subscription",
  });
  if (forgedPayload instanceof Error) return next(bad());

  const {
    merchantRefNumber,
    authNumber,
    orderAmount,
    paymentAmount,
    fawryFees,
    paymentTime,
    statusCode,
    statusDescription,
  } = await fawry.payWithBankInstallments({
    ...forgedPayload,
    paymentMethod: "CARD",
    installmentPlanId: payload.planId,
    cardToken: payload.cardToken,
    cvv: payload.cvv.toString(),
    returnUrl: payload.returnUrl,
    enable3DS: true,
    authCaptureModePayment: true,
  });

  // TODO: store orderRefNumber in the transaction row

  const response: IFawry.PayWithBankInstallmentsResponse = {
    transactionId: Number(merchantRefNumber),
    authNumber,
    orderAmount,
    paymentAmount,
    fawryFees,
    paymentTime,
    statusCode,
    statusDescription,
  };

  res.json(response);
}

async function cancelUnpaidOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const payload = cancelUnpaidOrderPayload.parse(req.body);
  const transaction = await transactions.findById(payload.transactionId);

  if (!transaction) return next(notfound.transaction());

  if (isStudent(user) && transaction.userId !== user.id)
    return next(forbidden());

  if (transaction.status !== ITransaction.Status.New)
    return next(
      bad("invalid transaction state, transaction cannot be canceled")
    );

  const merchantRefNumber = encodeMerchantRefNumber({
    transactionId: transaction.id,
    createdAt: transaction.createdAt,
  });

  const { fawryRefNumber } = await fawry.getPaymentStatus(merchantRefNumber);

  const result = await safePromise(fawry.cancelUnpaidOrder(fawryRefNumber));
  if (result instanceof Error)
    return next(fawryError("Failed to cancel order"));

  await transactions.update(transaction.id, {
    status: ITransaction.Status.Canceled,
  });

  res.sendStatus(200);
}

async function refund(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = refundPayload.parse(req.body);

  const { statusCode, statusDescription } = await fawry.refund({
    merchantCode: fawryConfig.merchantCode,
    referenceNumber: payload.orderRefNum,
    refundAmount: price.unscale(payload.refundAmount),
    reason: payload.reason,
    signature: genSignature.forRefundRequest({
      referenceNumber: payload.orderRefNum,
      reason: payload.reason,
      refundAmount: price.unscale(payload.refundAmount),
    }),
  });

  const response: IFawry.RefundResponse = {
    statusCode,
    statusDescription,
  };

  if (FawryStatusMap[statusCode] === FawryStatusEnum.Ok) {
    const { list } = await transactions.find({
      providerRefNums: [Number(payload.orderRefNum)],
    });
    const tx = first(list)!;
    await transactions.update(tx.id, {
      status:
        tx.amount < payload.refundAmount
          ? ITransaction.Status.PartialRefunded
          : ITransaction.Status.Refunded,
    });
  }

  res.json(response);
}

async function getAddCardTokenUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const url = new URL(FAWRY_ROUTES.ADD_CARD_TOKEN, FAWRY_API_URL_CURRENT);
  const params = new URLSearchParams({
    accNo: fawryConfig.merchantCode,
    customerProfileId: user.id.toString(),
    returnUrl: clientRouter.web({ route: Web.CardAdded, full: true }),
    locale: "ar",
  }).toString();

  const response: IFawry.GetAddCardTokenUrlResponse = {
    url: `${url}?${params}`,
  };

  res.status(200).json(response);
}

async function findCardTokens(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { userId }: IFawry.FindCardTokensApiQuery = findCardTokensQuery.parse(
    req.query
  );
  if (isStudent(user) && userId !== user.id) return next(forbidden());

  const result = await fawry.findCardTokens(userId);
  if (result.statusCode !== 200)
    return next(fawryError(result.statusDescription));

  const response: IFawry.FindCardTokensResponse = { cards: result.cards };

  res.status(200).json(response);
}

async function deleteCardToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { cardToken, userId }: IFawry.DeleteCardTokenPayload =
    deleteCardTokenPayload.parse(req.body);
  if (isStudent(user) && userId !== user.id) return next(forbidden());

  const result = await fawry.findCardTokens(userId);
  if (result.statusCode !== 200)
    return next(fawryError(result.statusDescription));

  const exist = result.cards.find((card) => card.token === cardToken);
  if (!exist) return next(notfound.base());

  const { statusCode, statusDescription } = await fawry.deleteCardToken({
    customerProfileId: userId,
    cardToken,
  });

  if (statusCode !== 200) return next(fawryError(statusDescription));

  res.sendStatus(200);
}

async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { transactionId } = getPaymentStatusPayload.parse(req.query);
  const transaction = await transactions.findById(transactionId);
  if (!transaction) return next(notfound.transaction());
  if (isStudent(user) && transaction.userId !== user.id)
    return next(forbidden());

  const merchantRefNumber = encodeMerchantRefNumber({
    transactionId: transaction.id,
    createdAt: transaction.createdAt,
  });

  const result = await safePromise(fawry.getPaymentStatus(merchantRefNumber));
  if (result instanceof Error) return next(result);

  const response: IFawry.GetPaymentStatusResponse = {
    orderStatus: ORDER_STATUS_TO_TRANSACTION_STATUS[result.orderStatus],
    orderRefNum: result.fawryRefNumber,
    paymentMethod:
      TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD[result.paymentMethod],
  };

  res.status(200).json(response);
}

function setPaymentStatus(context: ApiContext) {
  return safeRequest(async function handler(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const paylaod = setPaymentStatusPayload.parse(req.body);

    // Validate signature: the signature in the request MUST match the one
    // generated by us.
    const signature = genSignature.forPaymentDetails({
      fawryRefNumber: paylaod.fawryRefNumber,
      merchantRefNumber: paylaod.merchantRefNumber,
      paymentAmount: paylaod.paymentAmount,
      orderAmount: paylaod.orderAmount,
      orderStatus: paylaod.orderStatus,
      paymentMethod: paylaod.paymentMethod,
      paymentRefrenceNumber: paylaod.paymentRefrenceNumber,
    });

    if (signature !== paylaod.messageSignature)
      return next(forbidden("Invalid signature"));

    const transactionId = decodeMerchantRefNumber(paylaod.merchantRefNumber);
    const userId = Number(paylaod.customerMerchantId);
    const fawryRefNumber = Number(paylaod.fawryRefNumber);

    const transaction = await transactions.findById(transactionId);
    if (!transaction)
      return next(
        bad(
          "transaction not found; invalid or missing merchant reference number; should never happen"
        )
      );

    if (transaction.userId !== userId)
      return next(
        bad(
          "user id mismatch; invalid customer merchant id; should never happen"
        )
      );

    const status = ORDER_STATUS_TO_TRANSACTION_STATUS[paylaod.orderStatus];
    const method =
      TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD[paylaod.paymentMethod];

    if (method !== transaction.paymentMethod)
      return next(bad("payment method mismatch; should never happen"));

    const plan = await plans.findById(transaction.planId);
    if (!plan) throw new Error("Plan not found; should never happen");

    const subscription = await subscriptions.findByTxId(transaction.id);
    const weekCount = PLAN_PERIOD_TO_WEEK_COUNT[transaction.planPeriod];
    const now = dayjs.utc();
    const end = now.add(weekCount, "week");
    const paid = status === ITransaction.Status.Paid;

    await knex.transaction(async (tx) => {
      // Update the transaction with the latest status.
      await transactions.update(
        transactionId,
        {
          status,
          providerRefNum: fawryRefNumber,
        },
        tx
      );

      if (!paid && subscription)
        return await subscriptions.update(subscription.id, {
          terminatedAt: now.toISOString(),
        });

      await subscriptions.create({
        tx,
        txId: transactionId,
        period: transaction.planPeriod,
        planId: transaction.planId,
        weeklyMinutes: plan.weeklyMinutes,
        userId,
        start: now.toISOString(),
        end: end.toISOString(),
      });
    });

    // notify user that his transaction status got updated
    context.io
      .to(asUserRoomId(userId))
      .emit(Wss.ServerEvent.TransactionStatusUpdate, {
        transactionId,
        status,
      });

    // Terminate request with fawry.
    res.sendStatus(200);
  });
}

async function syncPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { transactionId } = syncPaymentPayload.parse(req.body);
  const transaction = await transactions.findById(transactionId);
  if (!transaction) return next(notfound.transaction());

  const merchantRefNumber = encodeMerchantRefNumber({
    transactionId: transaction.id,
    createdAt: transaction.createdAt,
  });

  const payment = await fawry.getPaymentStatus(merchantRefNumber);

  const status = ORDER_STATUS_TO_TRANSACTION_STATUS[payment.orderStatus];

  if (status === transaction.status) {
    res.status(304);
    return;
  }

  const plan = await plans.findById(transaction.planId);
  if (!plan) throw new Error("plan not found, should never happen");

  const weekCount = PLAN_PERIOD_TO_MONTH_COUNT[transaction.planPeriod];
  const subscription = await subscriptions.findByTxId(transaction.id);

  await knex.transaction(async (tx) => {
    await transactions.update(
      transaction.id,
      {
        status,
        providerRefNum: Number(payment.fawryRefNumber),
      },
      tx
    );

    const paid = status === ITransaction.Status.Paid;

    // terminate subscription in case the tx was canceled, refunded, or failed.
    if (subscription && !paid)
      return await subscriptions.update(subscription.id, {
        terminatedAt: dayjs.utc().toISOString(),
      });

    if (paid && !subscription) {
      // Default to now in case the payment time is missing.
      const start =
        dayjs.utc(payment.paymentTime).startOf("day") ||
        dayjs.utc().startOf("day");
      const end = start.add(weekCount, "week");
      return subscriptions.create({
        tx,
        txId: transaction.id,
        period: transaction.planPeriod,
        planId: transaction.planId,
        weeklyMinutes: plan.weeklyMinutes,
        userId: transaction.userId,
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  });

  res.sendStatus(200);
}

export default {
  payWithCard: safeRequest(payWithCard),
  payWithRefNum: safeRequest(payWithRefNum),
  payWithEWallet: safeRequest(payWithEWallet),
  payWithBankInstallments: safeRequest(payWithBankInstallments),
  cancelUnpaidOrder: safeRequest(cancelUnpaidOrder),
  refund: safeRequest(refund),
  getAddCardTokenUrl: safeRequest(getAddCardTokenUrl),
  findCardTokens: safeRequest(findCardTokens),
  deleteCardToken: safeRequest(deleteCardToken),
  getPaymentStatus: safeRequest(getPaymentStatus),
  syncPaymentStatus: safeRequest(syncPaymentStatus),
  setPaymentStatus,
};
