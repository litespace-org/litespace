import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

import {
  isAdmin,
  isRegularUser,
  isStudent,
  isValidPhone,
} from "@litespace/utils";
import { IFawry } from "@litespace/types";

import { fawry } from "@/fawry/api";
import { bad, forbidden, notfound } from "@/lib/error";
import { forgeFawryPayload } from "@/lib/fawry";
import { genSignature } from "@/fawry/lib";
import { fawryConfig } from "@/constants";
import { datetime, id } from "@/validation/utils";
import dayjs from "@/lib/dayjs";
import { FAWRY_API_URL_CURRENT, FAWRY_ROUTES } from "@/fawry/constants";
import { clientRouter } from "@/lib/client";
import { Web } from "@litespace/utils/routes";
import { users } from "@litespace/models";

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

async function payWithCard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload: IFawry.PayWithCardPayload = payWithCardPayload.parse(req.body);

  const userPhone = user.phone;
  const reqPhone = payload.phone;
  const phone = userPhone || reqPhone;
  const noPhone = !userPhone && !reqPhone;
  const invalidReqPhone = reqPhone && !isValidPhone(reqPhone);
  const mismatch = userPhone && reqPhone && userPhone !== reqPhone;
  if (noPhone || !phone || invalidReqPhone || mismatch)
    return next(bad("Invalid or missing phone number"));

  // Update user phone if needed.
  if (!userPhone) await users.update(user.id, { phone });

  const { nextAction, statusCode, statusDescription } =
    await fawry.payWithCardToken({
      customer: {
        id: user.id,
        email: user.email,
        name: user.name || "LiteSpace Student",
        phone,
      },
      transactionId: Math.floor(Math.random() * 1000),
      amount: 100.23,
      cardToken: payload.cardToken,
      cvv: payload.cvv,
    });

  console.log({ nextAction });

  const response: IFawry.PayWithCardResponse = {
    transactionId: 1,
    redirectUrl: "",
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

  res.json(response);
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

  const result = await fawry.getPaymentStatus(transactionId);

  // todo: add response type
  const response = result;

  res.status(200).json(response);
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
};
