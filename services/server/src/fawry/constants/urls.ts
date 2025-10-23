import { environment } from "@/constants";

export const FAWRY_API_URL_PROD = "https://www.atfawry.com";
export const FAWRY_API_URL_STAGING = "https://atfawry.fawrystaging.com";
export const FAWRY_API_URL_CURRENT =
  environment === "production" ? FAWRY_API_URL_PROD : FAWRY_API_URL_STAGING;

export const FAWRY_ROUTES = {
  PAY_WITH_REFNUM: "/ECommerceWeb/Fawry/payments/charge",
  PAY_WITH_CARD: "/ECommerceWeb/Fawry/payments/charge",
  PAY_WITH_EWALLET: "/ECommerceWeb/api/payments/charge",
  PAY_WITH_BANK_INSTALLMENTS: "/ECommerceWeb/api/merchant/installment-plans",
  // read docs for this part: https://developer.fawrystaging.com/docs/server-apis/auth-capture-payment-apis
  AUTHORIZE_PAYMENT: "/ECommerceWeb/Fawry/payments/charge",
  CAPTURE_PAYMENT: "/ECommerceWeb/api/payment/capture",
  CANCEL_AUTHORIZED_PAYMENT: "/ECommerceWeb/api/payment/cancel",
  GET_PAYMENT_STATUS: `/ECommerceWeb/Fawry/payments/status/v2`,
  CANCEL_UNPAID_ORDER: "/ECommerceWeb/api/orders/cancel-unpaid-order",
  REFUND: "/ECommerceWeb/Fawry/payments/refund",
  CREATE_CARD_TOKEN_V1: "/ECommerceWeb/api/cards/cardToken",
  ADD_CARD_TOKEN: "/atfawry/plugin/card-token",
  CREATE_CARD_TOKEN_V2: "/fawrypay-api/api/cards/cardToken",
  LIST_CARD_TOKENS: "/ECommerceWeb/Fawry/cards/cardToken",
  DELETE_CARD_TOKEN: "/ECommerceWeb/Fawry/cards/cardToken",
  EXPRESS: "/fawrypay-api/api/payments/init",
} as const;
