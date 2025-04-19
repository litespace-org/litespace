import {
  CurrencyCode,
  Language,
  PaymentMethod,
} from "@/fawry/types/ancillaries";

export type Customer = {
  id: number;
  phone: string;
  name?: string;
  email: string;
};

export type BaseRequestPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The unique reference number for the charge request in merchant system.
   */
  merchantRefNum: number;
  /**
   * The customer mobile in merchant system: 01xxxxxxx.
   */
  customerMobile: Customer["phone"];
  /**
   * The customer e-mail in merchant system: test@email.com.
   */
  customerEmail: Customer["email"];
  /**
   * The charge amount: must be in the form of xx.xx.
   */
  amount: number;
  currencyCode: CurrencyCode;
  language: Language;
  chargeItems: Array<{
    /**
     * The id for the charge item
     */
    itemId: string;
    /**
     * Description of charge item.
     */
    description: string;
    /**
     * Price per unit charge item.
     */
    price: number;
    /**
     * Quantity of the charge items.
     */
    quantity: number;
  }>;
  /**
   * The SHA-256 digested for the following concatenated string "merchantCode + merchantRefNum +
   * customerProfileId (if exists, otherwise "") + paymentMethod + amount (in two decimal format
   * 10.00) + cardNumber + cardExpiryYear + cardExpiryMonth + cvv + returnUrl + secureKey"
   */
  signature: string;
  paymentMethod: PaymentMethod;
  description: string;
  /**
   * The unique customer profile ID in merchant system. This can be the user ID.
   */
  customerProfileId: Customer["id"];
  /**
   * The customer name in merchant system.
   */
  customerName: Customer["name"];
  /**
   * WebHook Url used to notify your application back end when an event
   * happens in this order like order paid, expired or refund
   */
  orderWebHookUrl?: string;
};

export type PayWithCardPayload = BaseRequestPayload & {
  paymentMethod: "CARD";
  /**
   * Card cvv code.
   */
  cvv: number;
  /**
   * Set to "true" to enable 3DS authentication.
   */
  enable3DS: boolean;
  /**
   * Set to "true" to enable authentication capture option.
   */
  authCaptureModePayment: boolean;
  /**
   * After the card issuing bank process the authentication process,
   * this will be the redirection URL where your customer will be redirected to.
   * Example: "https://www.google.com/"
   */
  returnUrl: string;
  /**
   * it is used to save the card to the specified customerProfileId provided in order to
   * be used in the future payments without collectind card data each time
   */
  saveCardInfo?: boolean;
} & (
    | {
        cardNumber: number;
        /**
         * Card Expiry Year in two digits format: 21, 22.
         */
        cardExpiryYear: number;
        /**
         * Card Expiry Month in two digits format: 05, 12.
         */
        cardExpiryMonth: number;
      }
    | {
        cardToken: string;
      }
  );

/**
 * Format of date in milliseconds.
 */
type Timestamp = number;

export type PayWithEWalletPayload = BaseRequestPayload & {
  paymentMethod: "MWALLET";
  /**
   * Use this element to set specific expiration time for the generated order.
   * After this time, the QR shall expire and the client will not be able to
   * confirm payment throuth it. This element take value as timestamp or in
   * the format of date in milliseconds, e.g. 1631138400000.
   */
  paymentExpiry?: Timestamp;
};

export type PayWithRefNumPayload = BaseRequestPayload & {
  paymentMethod: "PAYATFAWRY";
  /**
   * Use this element to set specific expiration time for the generated order.
   * After this time, the received reference number shall expire and the client
   * will not be able to pay using it. This element take value as timestamp or
   * in the format of date in milliseconds, e.g. 1631138400000.
   */
  paymentExpiry?: Timestamp;
};

export type GetInstallmentPlansPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  accountNumber: string;
};

/**
 * NOTE: authCaptureModePayment & enable3DS don't exist in the docs for this
 * payment methods. However, I assumes this's a mistake in the docs.
 */
export type PayWithCardAndBankInstallmentsPayload = PayWithCardPayload & {
  installmentPlanId: number;
};

export type RefundPayload = {
  /**
   * The merchant code provided during account setup.
   */
  merchantCode: string;
  /**
   * The customer order reference number.
   */
  referenceNumber: string;
  /**
   * The required amount to be refunded.
   */
  refundAmount: number;
  /**
   * The SHA-256 digested for the following concatenated string merchantCode +
   * referenceNumber + refund amount in two decimal format (10.00) + refund
   * reason (if exists) + secureKey
   */
  signature: string;
  /**
   * The reason of the refund.
   */
  reason?: string;
};

export type CreateCardTokenPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The unique customer profile ID in merchant system. This can be the user ID.
   */
  customerProfileId: number;
  /**
   * The customer mobile in merchant system: 01xxxxxxx
   */
  customerMobile: string;
  /**
   * The customer e-mail in merchant system.
   */
  customerEmail: string;
  /**
   * 12 Digits Card number.
   */
  cardNumber: number;
  /**
   * Customer name on the card or any alias.
   */
  cardAlias: string;
  /**
   * The two digit format for the card expiry year for example 21.
   */
  expiryYear: number;
  /**
   * The two digit format for the card expiry month for example 05.
   */
  expiryMonth: number;
  /**
   * 3 Digits card CVV.
   */
  cvv: number;
  /**
   * Defines if this card is default one or not
   */
  isDefault: boolean;
  /**
   * Set to "true" to enable 3DS authentication.
   */
  enable3ds: boolean;
  /**
   * Any URL Fawry can redirect the customer back to , Fawry will add "statusCode"
   * and "statusDescription" as a query params to the end of that url,
   * e.g: https://.../any-path?statusCode=200&statusDescription=OperationDone.
   */
  returnUrl: string;
};

export type ListCardTokensPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The unique customer profile ID in merchant system. This can be the user ID.
   */
  customerProfileId: number;
  /**
   * The SHA-256 digested for the following concatenated string merchantCode +
   * customerProfileId + secureKey
   */
  signature: string;
};

export type DeleteCardTokenPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The unique customer profile ID in merchant system. This can be the user ID.
   */
  customerProfileId: number;
  /**
   * The SHA-256 digested for the following concatenated string merchantCode +
   * customerProfileId + secureKey
   */
  signature: string;
  /**
   * The specific card token you wish to delete.
   */
  cardToken: string;
};

export type CancelUnpaidOrderPayload = {
  /**
   * The merchant code provided during account setup.
   */
  merchantAccount: string;
  /**
   * The customer order reference number.
   */
  orderRefNo: string;
  lang: Language;
  /**
   * The SHA-256 digested for the following concatenated string
   * (orderRefNo + merchantAccount + lang + secureKey
   */
  signature: string;
};

export type AuthorizePaymentPayload = Omit<
  PayWithCardPayload,
  "enable3DS" | "returnUrl" | "orderWebHookUrl" | "saveCardInfo"
>;

export type CapturePaymentPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The unique reference number for the charge request in merchant system.
   * You should have received this number at the time of payment authorization.
   */
  merchantRefNum: number;
  /**
   * The SHA-256 digested for the following concatenated string "merchantRefNum + captureAmount
   * (if exist in two decimal format 10.00, otherwise "") + merchantCode + secureKey"
   */
  requestSignature: string;
  /**
   * in case you need to capture a partial amount of the order total amount in case you
   * didn`t add the captureAmount parameter, we will capture the full amount.
   */
  captureAmount?: number;
};

export type CancelPaymentAuthPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The unique reference number for the charge request in merchant system.
   * You should have received this number at the time of payment authorization.
   */
  merchantRefNum: number;
  /**
   * The SHA-256 digested for the following concatenated string "merchantRefNum + merchantCode + secureKey"
   */
  requestSignature: string;
};

export type GetPaymentStatusPayload = {
  /**
   * The merchant code provided by FawryPay team during the account setup.
   */
  merchantCode: string;
  /**
   * The merchant reference number for the required order.
   */
  merchantRefNumber: string;
  /**
   * The request signature it contains the SHA-256 digest value for merchantCode + merchnatRefNumber + secureKey
   */
  signature: string;
};
