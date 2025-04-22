import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

import { isAdmin, isRegularUser, isStudent, price } from "@litespace/utils";
import { IFawry, ITransaction, Wss } from "@litespace/types";

import { fawry } from "@/fawry/api";
import { bad, forbidden, notfound } from "@/lib/error";
import { forgeFawryPayload } from "@/lib/fawry";
import { genSignature } from "@/fawry/lib";
import { fawryConfig } from "@/constants";
import { datetime, id, unionOfLiterals } from "@/validation/utils";
import dayjs from "@/lib/dayjs";
import {
  FAWRY_API_URL_CURRENT,
  FAWRY_ROUTES,
  TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD,
  TRANSACTION_STATUS_TO_FAWRY_ORDER_STATUS,
} from "@/fawry/constants";
import { clientRouter } from "@/lib/client";
import { Web } from "@litespace/utils/routes";
import { transactions, users } from "@litespace/models";
import { ApiContext } from "@/types/api";
import { OrderStatus, PaymentMethod } from "@/fawry/types/ancillaries";
import { asUserRoomId } from "@/wss/utils";
import { withPhone } from "@/lib/user";
import {
  decodeMerchantRefNumber,
  encodeMerchantRefNumber,
} from "@/fawry/lib/ids";

const payWithCardPayload = zod.object({
  planId: id,
  cardToken: zod.string(),
  cvv: zod.number(),
  duration: zod.null(),
  phone: zod.string().optional(),
});

const payWithRefNumPayload = zod.object({
  amount: zod.number(),
  paymentExpirey: datetime.optional(),
});

const payWithEWalletPayload = zod.object({
  amount: zod.number(),
  paymentExpirey: datetime.optional(),
});

const payWithBankInstallmentsPayload = zod.object({
  planId: zod.number(),
  amount: zod.number(),
  cardToken: zod.string(),
  cvv: zod.number(),
  returnUrl: zod.string(),
});

const cancelUnpaidOrderPayload = zod.object({
  transactionId: id,
});

const refundPayload = zod.object({
  orderRefNum: zod.string(),
  refundAmount: zod.number(),
  reason: zod.string().optional(),
});

const deleteCardTokenPayload = zod.object({
  cardToken: zod.string(),
});

const getPaymentStatusPayload = zod.object({
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
  ]),
  paymentTime: zod.number().optional(),
  paymentRefrenceNumber: zod.string().optional(),
  messageSignature: zod.string(),
  failureErrorCode: zod.number().optional(),
  failureReason: zod.string().optional(),
});

async function payWithCard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithCardPayload = payWithCardPayload.parse(req.body);
  const { valid, phone, update } = withPhone(user.phone, payload.phone);
  if (!valid || !phone) return next(bad("Invalid or missing phone number"));
  // Update user phone if needed.
  if (!update) await users.update(user.id, { phone });

  const amount = 100;

  const transaction = await transactions.create({
    userId: user.id,
    providerRefNum: null,
    /**
     * Any number (e.g., amount, price) that enter the database should be scaled
     * up and any extra decimals should be removed.
     */
    amount: price.scale(amount),
    paymentMethod: ITransaction.PaymentMethod.Card,
  });

  const { nextAction, statusCode, statusDescription } = await fawry.payWithCard(
    {
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
      amount: transaction.amount,
      cardToken: payload.cardToken,
      cvv: payload.cvv,
    }
  );

  const response: IFawry.PayWithCardResponse = {
    transactionId: transaction.id,
    redirectUrl: nextAction?.redirectUrl,
    statusCode,
    statusDescription,
  };

  res.json(response);
}

async function payWithRefNum(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = payWithRefNumPayload.parse(req.body);

  // TODO: store transaction in the database
  const txId = Math.floor(Math.random() * 1000);
  const forgedPayload = forgeFawryPayload({
    merchantRefNum: txId,
    paymentMethod: "PAYATFAWRY",
    amount: payload.amount,
    signature: genSignature.forPayWithRefNum({
      merchantRefNum: txId,
      amount: payload.amount,
      customerProfileId: user.id,
    }),
    customer: {
      id: user.id,
      phone: user.phone || "",
      email: user.email,
      name: user.name || undefined,
    },
  });

  const {
    orderStatus,
    orderAmount,
    paymentAmount,
    fawryFees,
    paymentTime,
    statusCode,
    statusDescription,
  } = await fawry.payWithRefNum({
    ...forgedPayload,
    paymentMethod: "PAYATFAWRY",
    paymentExpiry: payload.paymentExpirey
      ? dayjs(payload.paymentExpirey).utc().unix()
      : undefined,
  });

  // TODO: store orderRefNumber in the transaction row

  const response: IFawry.PayWithRefNumResponse = {
    transactionId: forgedPayload.merchantRefNum,
    orderStatus,
    orderAmount,
    paymentAmount,
    fawryFees,
    paymentTime,
    statusCode,
    statusDescription,
  };

  res.json(response);
}

async function payWithEWallet(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = payWithEWalletPayload.parse(req.body);

  // TODO: store transaction in the database
  const txId = Math.floor(Math.random() * 1000);

  const forgedPayload = forgeFawryPayload({
    merchantRefNum: txId,
    paymentMethod: "MWALLET",
    amount: payload.amount,
    signature: genSignature.forPayWithEWallet({
      merchantRefNum: txId,
      amount: payload.amount,
      customerProfileId: user.id,
    }),
    customer: {
      id: user.id,
      phone: user.phone || "",
      email: user.email,
      name: user.name || undefined,
    },
  });
  if (forgedPayload instanceof Error) return next(bad());

  const {
    referenceNumber,
    merchantRefNumber,
    walletQr,
    statusCode,
    statusDescription,
  } = await fawry.payWithEWallet({
    ...forgedPayload,
    paymentMethod: "MWALLET",
    paymentExpiry: payload.paymentExpirey
      ? dayjs(payload.paymentExpirey).utc().unix()
      : undefined,
  });

  // TODO: store orderRefNumber in the transaction row

  const response: IFawry.PayWithEWalletResponse = {
    transactionId: Number(merchantRefNumber),
    orderRefNum: referenceNumber,
    walletQr,
    statusCode,
    statusDescription,
  };

  res.json(response);
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
      cvv: payload.cvv,
      cardToken: payload.cardToken,
      customerProfileId: user.id,
      installmentPlanId: 1,
    }),
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
    cvv: payload.cvv,
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

  const { fawryRefNumber } = await fawry.getPaymentStatus(
    payload.transactionId
  );

  // todo: code, description, and reason are undefined for success status.
  const { code, description, reason } =
    await fawry.cancelUnpaidOrder(fawryRefNumber);

  const response: IFawry.CancelUnpaidOrderResponse = {
    statusCode: code,
    statusDescription: description,
    reason,
  };

  res.json(response);
}

async function refund(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = refundPayload.parse(req.body);

  const { statusCode, statusDescription } = await fawry.refund({
    merchantCode: fawryConfig.merchantCode,
    referenceNumber: payload.orderRefNum,
    refundAmount: payload.refundAmount,
    reason: payload.reason,
    signature: genSignature.forRefundRequest({
      referenceNumber: payload.orderRefNum,
      reason: payload.reason,
      refundAmount: payload.refundAmount,
    }),
  });

  const response: IFawry.RefundResponse = {
    statusCode,
    statusDescription,
  };

  // TODO: update transaction in the database

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
    returnUrl: clientRouter.web({ route: Web.Subscription, full: true }),
    locale: "ar",
  }).toString();

  const response = {
    url: `${url}?${params}`,
  };

  res.status(200).json(response);
}

async function listCardTokens(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { cards, statusCode, statusDescription } = await fawry.listCardTokens(
    user.id
  );

  const response: IFawry.ListCardTokensResponse = {
    cards,
    statusCode,
    statusDescription,
  };

  res.json(response);
}

async function deleteCardToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { cardToken } = deleteCardTokenPayload.parse(req.body);
  const customerProfileId = user.id;

  const { cards } = await fawry.listCardTokens(user.id);
  const exist = cards.find((card) => card.token === cardToken);
  if (!exist) return next(notfound.base());

  const { statusCode, statusDescription } = await fawry.deleteCardToken({
    customerProfileId,
    cardToken,
  });

  const response: IFawry.DeleteCardTokenResponse = {
    statusCode,
    statusDescription,
  };

  res.status(200).json(response);
}

async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const { transactionId } = getPaymentStatusPayload.parse(req.body);
  const transaction = await transactions.findById(transactionId);
  if (!transaction) return next(notfound.transaction());

  const merchantRefNumber = encodeMerchantRefNumber({
    transactionId: transaction.id,
    createdAt: transaction.createdAt,
  });

  const result = await fawry.getPaymentStatus(merchantRefNumber);

  // todo: add response type
  const response = result;

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
      return next(forbidden("Invalid signature."));

    const transactionId = decodeMerchantRefNumber(paylaod.merchantRefNumber);
    const userId = Number(paylaod.customerMerchantId);
    const fawryRefNumber = Number(paylaod.fawryRefNumber);

    const transaction = await transactions.findById(transactionId);
    if (!transaction)
      return next(
        bad(
          "Transaction not found; invalid or missing merchant reference number; should never happen."
        )
      );

    if (transaction.userId !== userId)
      return next(
        bad(
          "User id mismatch; invalid customer merchant id; should never happen."
        )
      );

    const status =
      TRANSACTION_STATUS_TO_FAWRY_ORDER_STATUS[paylaod.orderStatus];

    const method =
      TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD[paylaod.paymentMethod];

    if (method !== transaction.paymentMethod)
      return next(bad("Payment method mismatch; should never happen."));

    // Update the transaction with the latest status.
    await transactions.update(transactionId, {
      status,
      providerRefNum: fawryRefNumber,
    });

    // Notify user that his payment status got updated
    context.io
      .to(asUserRoomId(userId))
      .emit(Wss.ServerEvent.PaymentStatusUpdate, {});

    // Terminate request with fawry.
    res.sendStatus(200);
  });
}

export default {
  payWithCard: safeRequest(payWithCard),
  payWithRefNum: safeRequest(payWithRefNum),
  payWithEWallet: safeRequest(payWithEWallet),
  payWithBankInstallments: safeRequest(payWithBankInstallments),
  cancelUnpaidOrder: safeRequest(cancelUnpaidOrder),
  refund: safeRequest(refund),
  getAddCardTokenUrl: safeRequest(getAddCardTokenUrl),
  listCardTokens: safeRequest(listCardTokens),
  deleteCardToken: safeRequest(deleteCardToken),
  getPaymentStatus: safeRequest(getPaymentStatus),
  setPaymentStatus,
};
