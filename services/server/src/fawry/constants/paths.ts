export const PAY_WITH_REFNUM = "/ECommerceWeb/Fawry/payments/charge";
export const PAY_WITH_CARD = "/ECommerceWeb/Fawry/payments/charge";
export const PAY_WITH_EWALLET = "/ECommerceWeb/api/payments/charge";
export const PAY_WITH_BANK_INSTALLMENTS =
  "/ECommerceWeb/api/merchant/installment-plans";

// read docs for this part: https://developer.fawrystaging.com/docs/server-apis/auth-capture-payment-apis
export const AUTHORIZE_PAYMENT = "/ECommerceWeb/Fawry/payments/charge";
export const CAPTURE_PAYMENT = "/ECommerceWeb/api/payment/capture";
export const CANCEL_AUTHORIZED_PAYMENT = "/ECommerceWeb/api/payment/cancel";

export const GET_PAYMENT_STATUS = ({
  merchantCode,
  merchantRefNumber,
  signature,
}: {
  merchantCode: string;
  merchantRefNumber: string;
  signature: string;
}) =>
  `/ECommerceWeb/Fawry/payments/status/v2?merchantCode=${merchantCode}&merchantRefNumber=${merchantRefNumber}&signature=${signature}`;

export const CANCEL_UNPAID_ORDER =
  "/ECommerceWeb/api/orders/cancel-unpaid-order";
export const REFUND = "/ECommerceWeb/Fawry/payments/refund";

export const CREATE_CARD_TOKEN_V1 = "/ECommerceWeb/api/cards/cardToken";
/**
 * this can be a mistake in the docs: https://developer.fawrystaging.com/docs/card-tokens/create-use-token
 */
export const CREATE_CARD_TOKEN_V2 = "/fawrypay-api/api/cards/cardToken";
export const LIST_CARD_TOKENS = ({
  merchantCode,
  customerProfileId,
  signature,
}: {
  merchantCode: string;
  customerProfileId: number;
  signature: string;
}) =>
  `/ECommerceWeb/Fawry/cards/cardToken?merchantCode=${merchantCode}&customerProfileId=${customerProfileId}&signature=${signature}`;
export const DELETE_CARD_TOKEN = "/ECommerceWeb/Fawry/cards/cardToken";
// https://www.fawrypay.com/ECommerceWeb/Fawry/cards/cardToken
