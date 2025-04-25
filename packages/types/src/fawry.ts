import { IPlan } from "@/index";

type BaseResponse = {
  /**
   * Fawry Api response status code
   */
  statusCode: number;
  /**
   * Fawry Api response status description
   */
  statusDescription: string;
};

/**
 * this's defined by fawry docs (cannot be changed or extended)
 * https://developer.fawrystaging.com/docs/card-tokens/create-use-token#key_value_list
 */
export type OrderStatus =
  | "NEW"
  | "PAID"
  | "CANCELED"
  | "REFUNDED"
  | "EXPIRED"
  | "PARTIAL_REFUNDED"
  | "FAILED";

export type PayWithCardPayload = {
  phone?: string;
  planId: number;
  period: IPlan.PeriodLiteral;
  cardToken: string;
  cvv: string;
};

export type PayWithCardResponse = BaseResponse & {
  transactionId: number;
  redirectUrl?: string;
};

export type PayWithRefNumPayload = {
  phone?: string;
  planId: number;
  period: IPlan.PeriodLiteral;
};

export type PayWithRefNumResponse = {
  transactionId: number;
  referenceNumber: number;
};

export type PayWithEWalletPayload = {
  planId: number;
  period: IPlan.PeriodLiteral;
  wallet: string;
  phone?: string;
};

export type PayWithEWalletResponse = {
  transactionId: number;
  referenceNumber: string;
  /**
   * Base 64 encoded PNG QR code image.
   * Example: "data:image/PNG;base64,iVBORw0KGgoAAAANSUhEUgA....=="
   */
  walletQr: string;
};

export type PayWithBankInstallmentsPayload = {
  planId: number;
  amount: number;
  cardToken: string;
  cvv: number;
  returnUrl: string;
};

export type PayWithBankInstallmentsResponse = BaseResponse & {
  transactionId: number;
  /**
   * Payment authentication number.
   * Example: 12336534
   */
  authNumber: string;
  /**
   * Order amount in two decimal places format.
   */
  orderAmount: number;
  /**
   * The paid amount in two decimal places format.
   */
  paymentAmount: number;
  /**
   * The payment processing fees.
   */
  fawryFees: number;
  /**
   * Timestamp to record when the payment has been processed.
   * Example: 1607879720568
   */
  paymentTime: number;
};

export type CancelUnpaidOrderPayload = {
  /**
   * The customer order reference number.
   */
  orderRefNum: string;
};

export type CancelUnpaidOrderResponse = BaseResponse & {
  reason: string;
};

export type RefundPayload = {
  /**
   * The customer order reference number.
   */
  orderRefNum: string;
  /**
   * The required amount to be refunded.
   */
  refundAmount: number;
  /**
   * The reason of the refund.
   */
  reason?: string;
};

export type RefundResponse = BaseResponse & {};

export type FindCardTokensResponse = BaseResponse & {
  cards: Array<{
    /**
     * The saved card token for your requested client ID.
     */
    token: string;
    /**
     * Timestamp of the token creation date.
     */
    creationDate: number;
    /**
     * The last four digits of the card
     */
    lastFourDigits: number;
    /**
     * The card issuer brand name
     */
    brand: string;
  }>;
};

export type DeleteCardTokenPayload = {
  cardToken: string;
};

export type DeleteCardTokenResponse = BaseResponse;

export type GetPaymentStatusResponse = unknown;

export type GetAddCardTokenUrlResponse = {
  url: string;
};
