import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

import { isRegularUser } from "@litespace/utils";
import { IFawry } from "@litespace/types";

import { fawryApi } from "@/fawry/api";
import { bad, forbidden } from "@/lib/error";
import { forgeFawryPayload } from "@/lib/fawry";
import { signature } from "@/fawry/lib";
import { fawryConfig } from "@/constants";
import { datetime } from "@/validation/utils";
import dayjs from "@/lib/dayjs";
import {
  CancelUnpaidOrderPayload,
  DeleteCardTokenPayload,
  ListCardTokensPayload,
  RefundPayload,
} from "@/fawry/types/requests";

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

  const forgedPayload = forgeFawryPayload({
    merchantRefNum: Math.floor(Math.random() * 1000), // TODO: get transaction id from the db
    paymentMethod: "CARD",
    amount: payload.amount,
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
      signature: signature.forGeneralRequest({
        secureKey: fawryConfig.secureKey,
        ...forgedPayload,
      }),
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

  const forgedPayload = forgeFawryPayload({
    merchantRefNum: Math.floor(Math.random() * 1000), // TODO: get transaction id from the db
    paymentMethod: "PAYATFAWRY",
    amount: payload.amount,
    user,
  });
  if (forgedPayload instanceof Error) return next(bad());

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
    signature: signature.forGeneralRequest({
      secureKey: fawryConfig.secureKey,
      ...forgedPayload,
    }),
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

  const forgedPayload = forgeFawryPayload({
    merchantRefNum: Math.floor(Math.random() * 1000), // TODO: get transaction id from the db
    paymentMethod: "MWALLET",
    amount: payload.amount,
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
    signature: signature.forGeneralRequest({
      secureKey: fawryConfig.secureKey,
      ...forgedPayload,
    }),
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

  const forgedPayload = forgeFawryPayload({
    merchantRefNum: Math.floor(Math.random() * 1000), // TODO: get transaction id from the db
    paymentMethod: "CARD",
    amount: payload.amount,
    user,
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
    signature: signature.forGeneralRequest({
      secureKey: fawryConfig.secureKey,
      ...forgedPayload,
    }),
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

  const forgedPayload: Omit<CancelUnpaidOrderPayload, "signature"> = {
    merchantAccount: fawryConfig.merchantCode,
    orderRefNo: payload.orderRefNum,
    lang: "ar-eg",
  };

  const { code, description, reason } = await fawryApi.cancelUnpaidOrder({
    ...forgedPayload,
    signature: signature.forCancelUnpaidOrderRequest({
      secureKey: fawryConfig.secureKey,
      ...forgedPayload,
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

  const forgedPayload: Omit<RefundPayload, "signature"> = {
    merchantCode: fawryConfig.merchantCode,
    referenceNumber: payload.orderRefNum,
    refundAmount: payload.refundAmount,
    reason: payload.reason,
  };

  const { statusCode, statusDescription } = await fawryApi.refund({
    ...forgedPayload,
    signature: signature.forRefundRequest({
      secureKey: fawryConfig.secureKey,
      ...forgedPayload,
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

  const forgedPayload: Omit<ListCardTokensPayload, "signature"> = {
    merchantCode: fawryConfig.merchantCode,
    customerProfileId: user.id,
  };

  const { cards, statusCode, statusDescription } =
    await fawryApi.listCardTokens({
      ...forgedPayload,
      signature: signature.forListCardTokensRequest({
        secureKey: fawryConfig.secureKey,
        ...forgedPayload,
      }),
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

  const forgedPayload: Omit<DeleteCardTokenPayload, "signature"> = {
    merchantCode: fawryConfig.merchantCode,
    customerProfileId: user.id,
    cardToken: payload.cardToken,
  };

  const { statusCode, statusDescription } = await fawryApi.deleteCardToken({
    ...forgedPayload,
    signature: signature.forDeleteCardTokenRequest({
      secureKey: fawryConfig.secureKey,
      ...forgedPayload,
    }),
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
