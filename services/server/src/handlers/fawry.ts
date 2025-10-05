import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";

import {
  isAdmin,
  isRegularUser,
  isStudent,
  PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD,
  PLAN_PERIOD_TO_MONTH_COUNT,
  price,
  safePromise,
} from "@litespace/utils";
import { IFawry, IPlan, ITransaction, Wss } from "@litespace/types";

import { fawry } from "@/fawry/api";
import { bad, fawryError, forbidden, notfound } from "@/lib/error/api";
import {
  performPayWithCardTx,
  performPayWithEWalletTx,
  performPayWithFawryRefNumTx,
} from "@/lib/fawry";
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
  planInvites,
  plans,
  subscriptions,
  transactions,
  txPlanTemps,
} from "@litespace/models";
import { ApiContext } from "@/types/api";
import { OrderStatus, PaymentMethod } from "@/fawry/types/ancillaries";
import { asUserRoomId } from "@/wss/utils";
import {
  decodeMerchantRefNumber,
  encodeMerchantRefNumber,
} from "@/fawry/lib/ids";
import { calculatePlanPrice } from "@/lib/plan";
import { withPhone } from "@/lib/user";
import { FawryStatusEnum, FawryStatusMap } from "@/fawry/types/errors";
import { first } from "lodash";
import { upsertSubscriptionByTxStatus } from "@/lib/subscription";
import { upsertLessonByTxStatus } from "@/lib/lesson";
import { createPaidPlanTx } from "@/lib/transaction";
import { FawryError } from "@/lib/error/local";
import { forgeFawryPayload } from "@/fawry/lib/utils";
import { withDevLog } from "@/lib/utils";

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
  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  if (plan.forInvitesOnly) {
    const { total: invited } = await planInvites.find({
      planIds: [plan.id],
      userIds: [user.id],
    });
    if (!invited) return next(forbidden());
  }

  const period = PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[payload.period];
  const { total, totalScaled } = calculatePlanPrice({ period, plan });

  const transaction = await createPaidPlanTx({
    userId: user.id,
    scaledAmount: totalScaled,
    paymentMethod: ITransaction.PaymentMethod.Card,
    planId: plan.id,
    planPeriod: period,
  });

  const result = await performPayWithCardTx({
    user,
    phone,
    transaction,
    cvv: payload.cvv,
    unscaledAmount: total,
    cardToken: payload.cardToken,
  });

  if (result instanceof FawryError) return next(fawryError(result.message));

  const response: IFawry.PayWithCardResponse = {
    transactionId: transaction.id,
    redirectUrl: result.redirectUrl,
  };

  res.status(200).json(response);
}

async function payWithRefNum(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithRefNumPayload = payWithRefNumPayload.parse(
    req.body
  );

  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  if (plan.forInvitesOnly) {
    const { total: invited } = await planInvites.find({
      planIds: [plan.id],
      userIds: [user.id],
    });
    if (!invited) return next(forbidden());
  }

  const period = PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[payload.period];
  const { total, totalScaled } = calculatePlanPrice({ period, plan });

  const transaction = await createPaidPlanTx({
    userId: user.id,
    scaledAmount: totalScaled,
    paymentMethod: ITransaction.PaymentMethod.Fawry,
    planId: plan.id,
    planPeriod: period,
  });

  const result = await performPayWithFawryRefNumTx({
    user,
    phone,
    transaction,
    unscaledAmount: total,
  });

  if (result instanceof FawryError) return next(fawryError(result.message));

  const response: IFawry.PayWithRefNumResponse = {
    transactionId: transaction.id,
    referenceNumber: Number(result.referenceNumber),
  };

  res.status(200).json(response);
}

async function payWithEWallet(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithEWalletPayload = payWithEWalletPayload.parse(
    req.body
  );

  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  if (plan.forInvitesOnly) {
    const { total: invited } = await planInvites.find({
      planIds: [plan.id],
      userIds: [user.id],
    });
    if (!invited) return next(forbidden());
  }

  const period = PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[payload.period];
  const { total, totalScaled } = calculatePlanPrice({ period, plan });

  const transaction = await createPaidPlanTx({
    userId: user.id,
    scaledAmount: totalScaled,
    paymentMethod: ITransaction.PaymentMethod.EWallet,
    planId: plan.id,
    planPeriod: period,
  });

  const result = await performPayWithEWalletTx({
    user,
    phone,
    transaction,
    unscaledAmount: total,
  });

  if (result instanceof FawryError) return next(fawryError(result.message));

  const response: IFawry.PayWithEWalletResponse = {
    transactionId: transaction.id,
    referenceNumber: result.referenceNumber,
    walletQr: result.walletQr,
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

  const plan = await plans.findById(payload.planId);
  if (!plan) return next(notfound.plan());

  if (plan.forInvitesOnly) {
    const { total: invited } = await planInvites.find({
      planIds: [plan.id],
      userIds: [user.id],
    });
    if (!invited) return next(forbidden());
  }

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

  if (
    transaction.status !== ITransaction.Status.New &&
    transaction.status !== ITransaction.Status.Processed
  )
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

  await transactions.update({
    id: transaction.id,
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
      providerRefNums: [payload.orderRefNum],
    });
    const tx = first(list);
    if (!tx) return next(notfound.transaction());
    await transactions.update({
      id: tx.id,
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
    const payload = withDevLog(setPaymentStatusPayload.parse(req.body));

    // Validate signature: the signature in the request MUST match the one
    // generated by us.
    const signature = genSignature.forPaymentDetails({
      fawryRefNumber: payload.fawryRefNumber,
      merchantRefNumber: payload.merchantRefNumber,
      paymentAmount: payload.paymentAmount,
      orderAmount: payload.orderAmount,
      orderStatus: payload.orderStatus,
      paymentMethod: payload.paymentMethod,
      paymentRefrenceNumber: payload.paymentRefrenceNumber,
    });

    if (signature !== payload.messageSignature)
      return next(forbidden("Invalid signature"));

    const txId = decodeMerchantRefNumber(payload.merchantRefNumber);
    const userId = Number(payload.customerMerchantId);

    const transaction = await transactions.findById(txId);
    if (!transaction)
      return next(
        bad(
          "Transaction not found; invalid or missing merchant reference number; should never happen"
        )
      );

    if (transaction.userId !== userId)
      return next(
        bad(
          "User id mismatch; invalid customer merchant id; should never happen"
        )
      );

    const status = ORDER_STATUS_TO_TRANSACTION_STATUS[payload.orderStatus];
    const method =
      TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD[payload.paymentMethod];

    if (method !== transaction.paymentMethod)
      return next(bad("payment method mismatch; should never happen"));

    if (transaction.type === ITransaction.Type.PaidPlan)
      await upsertSubscriptionByTxStatus({
        status,
        txId: transaction.id,
        userId: transaction.userId,
        fawryRefNumber: payload.fawryRefNumber,
      });

    if (transaction.type === ITransaction.Type.PaidLesson)
      await upsertLessonByTxStatus({
        status,
        txId: transaction.id,
        userId: transaction.userId,
        fawryRefNumber: payload.fawryRefNumber,
        io: context.io,
      });

    // notify user that his transaction status got updated
    context.io
      .to(asUserRoomId(userId))
      .emit(Wss.ServerEvent.TransactionStatusUpdate, {
        transactionId: txId,
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

  const subscription = await subscriptions.findByTxId(transaction.id);

  await knex.transaction(async (tx) => {
    await transactions.update({
      id: transaction.id,
      status:
        status === ITransaction.Status.New
          ? ITransaction.Status.Processed
          : status,
      providerRefNum: payment.fawryRefNumber,
    });

    const paid = status === ITransaction.Status.Paid;

    // terminate subscription in case the tx was canceled, refunded, or failed.
    if (
      subscription &&
      (status === ITransaction.Status.Canceled ||
        status === ITransaction.Status.Refunded ||
        status === ITransaction.Status.Failed)
    )
      return await subscriptions.update(subscription.id, {
        terminatedAt: dayjs.utc().toISOString(),
      });

    if (paid && !subscription) {
      const txPlan = await txPlanTemps.findByTxId({
        tx,
        txId: transaction.id,
      });
      if (!txPlan) throw new Error("Temporary plan data not found.");

      const plan = await plans.findById(txPlan.planId);
      if (!plan) throw new Error("Plan not found");

      // Default to now in case the payment time is missing.
      const start =
        dayjs.utc(payment.paymentTime).startOf("day") ||
        dayjs.utc().startOf("day");
      const weekCount = PLAN_PERIOD_TO_MONTH_COUNT[txPlan.planPeriod];
      const end = start.add(weekCount, "week");

      await subscriptions.create({
        tx,
        txId: transaction.id,
        period: txPlan.planPeriod,
        planId: txPlan.planId,
        weeklyMinutes: plan.weeklyMinutes,
        userId: transaction.userId,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      await txPlanTemps.delete({ tx, txId: transaction.id });
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
