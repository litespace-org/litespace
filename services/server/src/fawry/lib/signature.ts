import { fawryConfig } from "@/constants";
import {
  CancelPaymentAuthPayload,
  CancelUnpaidOrderPayload,
  CapturePaymentPayload,
  BaseRequestPayload,
  RefundPayload,
  PayWithRefNumPayload,
  PayWithEWalletPayload,
  PayWithCardAndBankInstallmentsPayload,
} from "@/fawry/types/requests";
import { createHash } from "node:crypto";
import { PaymentMethod } from "@/fawry/types/ancillaries";

function generateSignature(...data: Array<string | number | undefined>) {
  const payload = data
    .map((value) => value?.toString())
    .filter((value) => !!value)
    .join("");
  return createHash("sha256").update(payload).digest("hex");
}

/**
 * The SHA-256 digested for the following concatenated string: "merchantCode + merchantRefNum +
 * customerProfileId (if exists, otherwise "") + paymentMethod + amount (in two decimal format
 * 10.00) + (cardNumber + cardExpiryYear + cardExpiryMonth or just, cardToken) + cvv + returnUrl + secureKey"
 */
export function forPayWithCard(
  data: {
    merchantRefNum: BaseRequestPayload["merchantRefNum"];
    customerProfileId: BaseRequestPayload["customerProfileId"];
    amount: BaseRequestPayload["amount"];
    cvv: number;
    returnUrl: string;
  } & (
    | { cardToken: string }
    | {
        cardNumber: string;
        cardExpiryYear: string;
        cardExpiryMonth: string;
      }
  )
): string {
  const paymentMethod: PaymentMethod = "CARD";
  const cardInfo =
    "cardToken" in data
      ? data.cardToken
      : [data.cardNumber, data.cardExpiryYear, data.cardExpiryMonth].join("");

  return generateSignature(
    fawryConfig.merchantCode,
    data.merchantRefNum,
    data.customerProfileId,
    paymentMethod,
    data.amount.toFixed(2),
    cardInfo,
    data.cvv,
    data.returnUrl,
    fawryConfig.secureKey
  );
}

/**
 * SHA-256 with the following order:
 * 1. merchantCode
 * 2. merchantRefNum
 * 3. customerProfileId
 * 4. payment ("PAYATFAWRY")
 * 5. amount
 * 6. secureKey
 */
export function forPayWithRefNum({
  merchantRefNum,
  customerProfileId,
  amount,
}: {
  merchantRefNum: PayWithRefNumPayload["merchantRefNum"];
  customerProfileId: PayWithRefNumPayload["customerProfileId"];
  amount: PayWithRefNumPayload["amount"];
}): string {
  const paymentMethod: PaymentMethod = "PAYATFAWRY";
  return generateSignature(
    fawryConfig.merchantCode,
    merchantRefNum,
    customerProfileId,
    paymentMethod,
    amount.toFixed(2),
    fawryConfig.secureKey
  );
}

/**
 * SHA-256 with the following order:
 * 1. merchantCode
 * 2. merchantRefNum
 * 3. customerProfileId
 * 4. payment ("MWALLET")
 * 5. amount
 * 6. secureKey
 */
export function forPayWithEWallet({
  merchantRefNum,
  customerProfileId,
  amount,
}: {
  merchantRefNum: PayWithEWalletPayload["merchantRefNum"];
  customerProfileId: PayWithEWalletPayload["customerProfileId"];
  amount: PayWithEWalletPayload["amount"];
}): string {
  const paymentMethod: PaymentMethod = "MWALLET";
  return generateSignature(
    fawryConfig.merchantCode,
    merchantRefNum,
    customerProfileId,
    paymentMethod,
    amount.toFixed(2),
    fawryConfig.secureKey
  );
}

/**
 * SHA-256 with the following order:
 * 1. merchantCode
 * 2. merchantRefNum
 * 3. customerProfileId
 * 4. payment ("CARD")
 * 5. amount
 * 7. cardToken (or cardNumber + cardExpiryYear + cardExpiryMonth)
 * 6. secureKey
 */
export function forPayWithBankInstallment(
  data: {
    merchantRefNum: PayWithCardAndBankInstallmentsPayload["merchantRefNum"];
    customerProfileId: PayWithCardAndBankInstallmentsPayload["customerProfileId"];
    amount: PayWithCardAndBankInstallmentsPayload["amount"];
    installmentPlanId: PayWithCardAndBankInstallmentsPayload["installmentPlanId"];
    cvv: PayWithCardAndBankInstallmentsPayload["cvv"];
  } & (
    | { cardToken: string }
    | {
        cardNumber: string;
        cardExpiryYear: string;
        cardExpiryMonth: string;
      }
  )
): string {
  const paymentMethod: PaymentMethod = "CARD";
  const cardInfo =
    "cardToken" in data
      ? data.cardToken
      : [data.cardNumber, data.cardExpiryYear, data.cardExpiryMonth].join("");

  return generateSignature(
    fawryConfig.merchantCode,
    data.merchantRefNum,
    data.customerProfileId,
    paymentMethod,
    data.amount.toFixed(2),
    cardInfo,
    data.cvv,
    data.installmentPlanId,
    fawryConfig.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string merchantCode +
 * referenceNumber + refund amount in two decimal format (10.00) + refund
 * reason (if exists) + secureKey
 */
export function forRefundRequest(
  data: Pick<RefundPayload, "referenceNumber" | "refundAmount" | "reason">
): string {
  return generateSignature(
    fawryConfig.merchantCode,
    data.referenceNumber,
    data.refundAmount,
    data.reason,
    fawryConfig.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string merchantCode +
 * customerProfileId + secureKey
 */
export function forListCardTokensRequest(customerProfileId: number): string {
  return generateSignature(
    fawryConfig.merchantCode,
    customerProfileId,
    fawryConfig.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string merchantCode +
 * customerProfileId + secureKey
 */
export function forDeleteCardTokenRequest(customerProfileId: number): string {
  return generateSignature(
    fawryConfig.merchantCode,
    customerProfileId,
    fawryConfig.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string
 * (orderRefNo + merchantAccount + lang + secureKey
 */
export function forCancelUnpaidOrderRequest(
  data: Pick<
    CancelUnpaidOrderPayload,
    "orderRefNo" | "merchantAccount" | "lang"
  >
): string {
  return generateSignature(
    data.orderRefNo,
    data.merchantAccount,
    data.lang,
    fawryConfig.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string "merchantRefNum + captureAmount
 * (if exist in two decimal format 10.00, otherwise "") + merchantCode + secureKey"
 */
export function forCapturePaymentRequest(
  data: Pick<CapturePaymentPayload, "merchantRefNum" | "captureAmount">
): string {
  return generateSignature(
    data.merchantRefNum,
    data.captureAmount,
    fawryConfig.merchantCode,
    fawryConfig.secureKey
  );
}

/**
 * The SHA-256 digested for the following concatenated string "merchantRefNum + merchantCode + secureKey"
 */
export function forCancelPaymentAuthRequest(
  merchantRefNum: CancelPaymentAuthPayload["merchantRefNum"]
): string {
  return generateSignature(
    merchantRefNum,
    fawryConfig.merchantCode,
    fawryConfig.secureKey
  );
}
