type GeneralResponse = {
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
  amount: number;
  cardToken: string;
  cvv: number;
  returnUrl: string;
};

export type PayWithCardResponse = GeneralResponse & {
  transactionId: number;
  redirectUrl: string;
};

export type PayWithRefNumPayload = {
  amount: number;
  /**
   * ISO datetime
   */
  paymentExpirey?: string;
};

export type PayWithRefNumResponse = GeneralResponse & {
  transactionId: number;
  orderStatus: OrderStatus;
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

export type PayWithEWalletPayload = {
  amount: number;
  /**
   * ISO datetime
   */
  paymentExpirey?: string;
};

export type PayWithEWalletResponse = GeneralResponse & {
  transactionId: number;
  /**
   * The reference number of the order on FawryPay system which is displayed to
   * the customer and used during the payment.
   * Example: 100162801
   */
  orderRefNum: string;
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

export type PayWithBankInstallmentsResponse = GeneralResponse & {
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

export type CancelUnpaidOrderResponse = GeneralResponse & {
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

export type RefundResponse = GeneralResponse & {};

export type ListCardTokensResponse = GeneralResponse & {
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

export type DeleteCardTokenResponse = GeneralResponse & {};
