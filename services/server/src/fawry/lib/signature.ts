import {
  CancelPaymentAuthPayload,
  CancelUnpaidOrderPayload,
  CapturePaymentPayload,
  DeleteCardTokenPayload,
  BaseRequestPayload,
  ListCardTokensPayload,
  RefundPayload,
} from "@/fawry/types/requests";
import { createHash } from "node:crypto";

function generateSignature(...data: Array<string | number | undefined>) {
  // concatenate data values
  let dataString = "";
  for (const value of data) {
    if (typeof value === "string") dataString += value || "";
    else if (value?.toString) dataString += value.toString() || "";
  }
  // hash the concatenated string with sha256 digest
  return createHash("sha256").update(dataString).digest("hex");
}

/**
 * The SHA-256 digested for the following concatenated string: "merchantCode + merchantRefNum +
 * customerProfileId (if exists, otherwise "") + paymentMethod + amount (in two decimal format
 * 10.00) + (cardNumber + cardExpiryYear + cardExpiryMonth or just, cardToken) + cvv + returnUrl + secureKey"
 */
export function forGeneralRequest(
  data: {
    secureKey: string;
    cardNumber?: number;
    cardExpiryYear?: number;
    cardExpiryMonth?: number;
    cardToken?: string;
    cvv?: number;
    returnUrl?: string;
  } & Pick<
    BaseRequestPayload,
    | "merchantCode"
    | "merchantRefNum"
    | "customerProfileId"
    | "paymentMethod"
    | "amount"
  >
): string {
  const cardInfo =
    data.cardToken ||
    data.cardNumber
      ?.toString()
      .concat(
        data.cardExpiryYear?.toString() || "",
        data.cardExpiryMonth?.toString() || ""
      );
  return generateSignature(
    data.merchantCode,
    data.merchantRefNum,
    data.customerProfileId,
    data.paymentMethod,
    data.amount,
    cardInfo,
    data.cvv,
    data.returnUrl,
    data.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string merchantCode +
 * referenceNumber + refund amount in two decimal format (10.00) + refund
 * reason (if exists) + secureKey
 */
export function forRefundRequest(
  data: {
    secureKey: string;
  } & Pick<
    RefundPayload,
    "merchantCode" | "referenceNumber" | "refundAmount" | "reason"
  >
): string {
  return generateSignature(
    data.merchantCode,
    data.referenceNumber,
    data.refundAmount,
    data.reason,
    data.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string merchantCode +
 * customerProfileId + secureKey
 */
export function forListCardTokensRequest(
  data: {
    secureKey: string;
  } & Pick<ListCardTokensPayload, "merchantCode" | "customerProfileId">
): string {
  return generateSignature(
    data.merchantCode,
    data.customerProfileId,
    data.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string merchantCode +
 * customerProfileId + secureKey
 */
export function forDeleteCardTokenRequest(
  data: {
    secureKey: string;
  } & Pick<DeleteCardTokenPayload, "merchantCode" | "customerProfileId">
): string {
  return generateSignature(
    data.merchantCode,
    data.customerProfileId,
    data.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string
 * (orderRefNo + merchantAccount + lang + secureKey
 */
export function forCancelUnpaidOrderRequest(
  data: {
    secureKey: string;
  } & Pick<CancelUnpaidOrderPayload, "orderRefNo" | "merchantAccount" | "lang">
): string {
  return generateSignature(
    data.orderRefNo,
    data.merchantAccount,
    data.lang,
    data.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string "merchantRefNum + captureAmount
 * (if exist in two decimal format 10.00, otherwise "") + merchantCode + secureKey"
 */
export function forCapturePaymentRequest(
  data: {
    secureKey: string;
  } & Pick<
    CapturePaymentPayload,
    "merchantRefNum" | "captureAmount" | "merchantCode"
  >
): string {
  return generateSignature(
    data.merchantRefNum,
    data.captureAmount,
    data.merchantCode,
    data.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string "merchantRefNum + merchantCode + secureKey"
 */
export function forCancelPaymentAuthRequest(
  data: {
    secureKey: string;
  } & Pick<CancelPaymentAuthPayload, "merchantRefNum" | "merchantCode">
): string {
  return generateSignature(
    data.merchantRefNum,
    data.merchantCode,
    data.secureKey
  );
}
