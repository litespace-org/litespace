import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

import { isRegularUser } from "@litespace/utils";
import { IFawry } from "@litespace/types";

import { fawryApi } from "@/fawry/api";
import { bad, forbidden } from "@/lib/error";
import { forgeFawryPayload } from "@/lib/fawry";
import { genSignature } from "@/fawry/lib";
import { fawryConfig } from "@/constants";
import { datetime } from "@/validation/utils";
import dayjs from "@/lib/dayjs";

const payWithCardPayload = zod.object({
  amount: zod.number(),
  cardToken: zod.string(),
  cvv: zod.number(),
  returnUrl: zod.string(),
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
  orderRefNum: zod.string(),
});

const refundPayload = zod.object({
  orderRefNum: zod.string(),
  refundAmount: zod.number(),
  reason: zod.string().optional(),
});

const deleteCardTokenPayload = zod.object({
  cardToken: zod.string(),
});

async function payWithCard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = payWithCardPayload.parse(req.body);

  // TODO: store transaction in the database

  const txId = Math.floor(Math.random() * 1000); // TODO: get transaction id from the db
  const signature = genSignature.forPayWithCard({
    amount: payload.amount,
    cardToken: payload.cardToken,
    cvv: payload.cvv,
    returnUrl: "todo",
    customerProfileId: user.id,
    merchantRefNum: txId,
  });

  const forgedPayload = forgeFawryPayload({
    merchantRefNum: txId,
    paymentMethod: "CARD",
    amount: payload.amount,
    signature,
    user,
  });
  if (forgedPayload instanceof Error) return next(bad());

  const { nextAction, statusCode, statusDescription } =
    await fawryApi.payWithCard({
      ...forgedPayload,
      paymentMethod: "CARD",
      cardToken: payload.cardToken,
      cvv: payload.cvv,
      returnUrl: payload.returnUrl,
      enable3DS: true,
      authCaptureModePayment: true,
    });

  // TODO: store orderRefNumber in the transaction row

  const response: IFawry.PayWithCardResponse = {
    transactionId: forgedPayload.merchantRefNum,
    redirectUrl: nextAction.redirectUrl,
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
    user,
  });

  const {
    orderStatus,
    orderAmount,
    paymentAmount,
    fawryFees,
    paymentTime,
    statusCode,
    statusDescription,
  } = await fawryApi.payWithRefNum({
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
    user,
  });
  if (forgedPayload instanceof Error) return next(bad());

  const {
    referenceNumber,
    merchantRefNumber,
    walletQr,
    statusCode,
    statusDescription,
  } = await fawryApi.payWithEWallet({
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
    user,
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
  } = await fawryApi.payWithBankInstallments({
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
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = cancelUnpaidOrderPayload.parse(req.body);

  const { code, description, reason } = await fawryApi.cancelUnpaidOrder({
    merchantAccount: fawryConfig.merchantCode,
    orderRefNo: payload.orderRefNum,
    lang: "ar-eg",
    signature: genSignature.forCancelUnpaidOrderRequest({
      orderRefNo: "1",
      lang: "ar-eg",
      merchantAccount: fawryConfig.merchantCode,
    }),
  });

  const response: IFawry.CancelUnpaidOrderResponse = {
    statusCode: code,
    statusDescription: description,
    reason,
  };

  // TODO: update transaction in the database

  res.json(response);
}

async function refund(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = refundPayload.parse(req.body);

  const { statusCode, statusDescription } = await fawryApi.refund({
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

async function listCardTokens(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const { cards, statusCode, statusDescription } =
    await fawryApi.listCardTokens({
      merchantCode: fawryConfig.merchantCode,
      customerProfileId: user.id,
      signature: genSignature.forListCardTokensRequest(user.id),
    });

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
  const allowed = isRegularUser(user);
  if (!allowed) return next(forbidden());

  const payload = deleteCardTokenPayload.parse(req.body);

  const { statusCode, statusDescription } = await fawryApi.deleteCardToken({
    merchantCode: fawryConfig.merchantCode,
    customerProfileId: user.id,
    cardToken: payload.cardToken,
    signature: genSignature.forDeleteCardTokenRequest(user.id),
  });

  const response: IFawry.DeleteCardTokenResponse = {
    statusCode,
    statusDescription,
  };

  res.json(response);
}

export default {
  payWithCard: safeRequest(payWithCard),
  payWithRefNum: safeRequest(payWithRefNum),
  payWithEWallet: safeRequest(payWithEWallet),
  payWithBankInstallments: safeRequest(payWithBankInstallments),
  cancelUnpaidOrder: safeRequest(cancelUnpaidOrder),
  refund: safeRequest(refund),
  listCardTokens: safeRequest(listCardTokens),
  deleteCardToken: safeRequest(deleteCardToken),
};
