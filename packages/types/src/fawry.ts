import { IPlan, ITransaction } from "@/index";

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

export type PaymentMethod = "CARD" | "MWALLET" | "PAYATFAWRY" | "Mobile Wallet";

export type PayWithCardPayload = {
  phone?: string;
  planId: number;
  period: IPlan.PeriodLiteral;
  cardToken: string;
  cvv: string;
};

export type PayWithCardResponse = {
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
  walletQr: string | null;
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
  transactionId: number;
};

export type CancelUnpaidOrderResponse = void;

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

export type FindCardTokensApiQuery = {
  userId: number;
};

export type FindCardTokensResponse = {
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
  userId: number;
};

export type DeleteCardTokenResponse = void;

export type GetPaymentStatusPayload = {
  transactionId: number;
};

export type GetPaymentStatusResponse = {
  orderRefNum: string;
  orderStatus: ITransaction.Status;
  paymentMethod: ITransaction.PaymentMethod;
};

export type SyncPaymentStatusPayload = {
  transactionId: number;
};

export type SyncPaymentStatusResponse = void;

export type GetAddCardTokenUrlResponse = {
  url: string;
};
