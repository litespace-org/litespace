import {
  OrderStatus,
  PaymentMethod,
  VerStatus,
} from "@/fawry/types/ancillaries";
import { FawryStatusCode } from "@/fawry/types/errors";

type GeneralResponse = {
  /**
   * Specific type of the response.
   * Example: "PaymentStatusResponse", "ChargeResponse", etc.
   */
  type: string;
  /**
   * The response status code.
   */
  statusCode: FawryStatusCode;
  /**
   * Exact description of the status of FawryPay response.
   */
  statusDescription: string;
};

export type PayWithCardResponse = GeneralResponse & {
  nextAction: {
    /**
     * Redirect URL for you to redirect your client for payment authentication.
     */
    redirectUrl: string;
    /**
     * The type of response.
     * Example: "THREE_D_SECURE"
     */
    type: string;
  };
};

export type PayWithEWalletResponse = GeneralResponse & {
  /**
   * The reference number of the order on FawryPay system which is displayed to
   * the customer and used during the payment.
   * Example: 100162801
   */
  referenceNumber: string;
  /**
   * The reference number of the order on merchant's system
   * Example: 23124654641
   */
  merchantRefNumber: string;
  /**
   * Base 64 encoded PNG QR code image.
   * Example: "data:image/PNG;base64,iVBORw0KGgoAAAANSUhEUgA....=="
   */
  walletQr: string;
};

export type PayWithRefNumResponse = GeneralResponse & {
  /**
   * FawryPay issued transaction reference number.
   */
  referenceNumber: string;
  /**
   * Merchant issued transaction reference number. This is the same as the reference number you have set in your charge request.
   */
  merchantRefNumber: string;
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
   * Payment Method Selected by your client.
   */
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  /**
   * Timestamp to record when the payment has been processed.
   * Example: 1607879720568
   */
  paymentTime: number;
  customerMobile: string;
  customerMail: string;
  /**
   * Customer Profile ID in the merchant's system.
   */
  customerProfileId: string;
  /**
   * Response Signature generated as the SHA-256 of the following concatenated string
   * (referenceNumber (if exist) + merchantRefNum + paymentAmount (in two decimal places
   * format 10.00) + orderAmount (in two decimal places format 10.00) + orderStatus +
   * paymentMethod + fawryFees (if exist) (in two decimal places format 10.00)) +
   * shippingFees (if exist) (in two decimal places format 10.00)) + authNumber (if exists) +
   * customerMail (if exist) + customerMobile (if exist) + secureKey)
   */
  signature: string;
};

export type GetInstallmentPlansResponse = {
  id: number;
  installmentPlan: {
    /**
     * Plan ID
     */
    id: number;
    /**
     * Arabic name of the plan
     */
    nameAr: string;
    /**
     * English name of the plan
     */
    nameEn: string;
    /**
     * The rate which the customer will pay if he selected this plan. It will be added to the original order amount.
     */
    rate: number;
    noOfMonths: number;
    merchantProfileCode: string;
    /**
     * The order amount should be between the minimum and maximum in order to be able to go with this plan
     */
    minAmount: number;
    /**
     * The order amount should be between the minimum and maximum in order to be able to go with this plan
     */
    maxAmount: number;
    startDate: number;
    endDate: number;
    online: boolean;
    /**
     * The status code and we always return the active plans only back to the client
     */
    status: {
      id: number;
      code: string;
      nameAr: string;
      nameEn: string;
    };
    /**
     * Represents the card name for example NBE credit card
     */
    accountType: {
      id: number;
      nameEn: string;
      nameAr: string;
      code: string;
      bank: {
        id: number;
        nameEn: string;
        nameAr: string;
        code: string;
        swfCode: string;
      };
      /**
       * List of card pans. If the card matches one of them, then he can select this plan.
       */
      pans: string[];
    };
    type: string;
  };
  applyTo: string;
  /**
   * If the plan configured for specific products, this list will contain the products SKUs.
   */
  products: unknown[];
  /**
   * If the plan configured for specific variants, this list will contain the variants SKUs.
   */
  productsCodes: unknown[];
  variants: unknown[];
  /**
   * If the plan configured for specific categories, this list will contain the categories codes.
   */
  categories: unknown[];
  requiredItemsValidation: boolean;
};

export type PayWithCardAndBankInstallmentsResponse = PayWithRefNumResponse & {
  /**
   * Payment authentication number.
   * Example: 12336534
   */
  authNumber: string;
};

export type RefundResponse = GeneralResponse & {};

export type CreateCardTokenResponse = GeneralResponse & {
  nextAction: {
    /**
     * Redirect URL for you to redirect your client for payment authentication.
     */
    redirectUrl: string;
    /**
     * The type of response.
     * Example: "THREE_D_SECURE"
     */
    type: string;
  };
  card: {
    /**
     * The generated card token to be used in future charges
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
     * The first six digits of the card
     */
    firstSixDigits: number;
    /**
     * The card issuer brand name
     */
    brand: string;
  };
};

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

export type DeleteCardTokenResponse = GeneralResponse & {};

export type CancelUnpaidOrderResponse = {
  code: number;
  description: string;
  reason: string;
};

export type AuthorizePaymentResponse = PayWithRefNumResponse & {};

export type CapturePaymentResponse = GeneralResponse & {
  /**
   * The reference number of the order on FawryPay system
   */
  fawryRefNumber: string;
  /**
   * The merchant ID on FawryPay system
   */
  merchantCode: string;
  /**
   * The reference number of the order on merchant's system
   */
  merchantRefNumber: string;
  /**
   * The status of the order
   */
  orderStatus: OrderStatus;
};

export type CancelPaymentAuthResponse = GeneralResponse & {
  /**
   * The reference number of the order on FawryPay system
   */
  fawryRefNumber: string;
  /**
   * The merchant ID on FawryPay system
   */
  merchantCode: string;
  /**
   * The reference number of the order on merchant's system
   */
  merchantRefNumber: string;
  /**
   * The status of the order
   */
  orderStatus: OrderStatus;
};

export type GetPaymentStatusResponse = {
  /**
   * UUID generated Request id
   */
  requestId: string;
  /**
   * The reference number of this order in atFawry system which is
   * displayed to the customer and used during the payment
   */
  fawryRefNumber: string;
  merchantRefNumber: string;
  customerName: string;
  customerMobile: string;
  customerMail: string;
  customerMerchantId: string;
  /**
   * The amount value received from merchant to be paid by the customer,
   * merchant can use it to verify that the customer pay the required amount
   * to enable the service to the customer
   */
  paymentAmount: number;
  /**
   * The payment Amount without the fees.
   */
  orderAmount: number;
  /**
   * The fees added by fawry for the order amount.
   */
  fawryFees: number;
  /**
   * Shipping fees amount if applicable
   */
  shippingFees: number;
  /**
   * The updated status of your transaction.
   */
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  /**
   * The actual time for the payment if the Order Status is PAID
   */
  paymentTime: Date;
  /**
   * The transaction number in the bank
   */
  authNumber: number;
  /**
   * Unique number registered in FawryPay system to keep track of the payment
   */
  paymentRefrenceNumber: string;
  /**
   * The order expiry in hours for this order if the merchant need to set specific
   * expiry for this order if not set we will use the configured expiry hour per merchant
   */
  orderExpiryDate: number;
  /**
   * There is some ambiguity in the docs for this part
   * see https://developer.fawrystaging.com/docs/server-apis/payment-notifications/get-payment-status-v2
   */
  orderItems: [
    {
      itemCode: string;
      price: number;
      quantity: number;
    },
  ];
  /**
   * "threeDSInfo" will be included only if the card is 3D secured.
   */
  threeDSInfo: {
    /**
     * The 3-D Secure Electronic Commerce Indicator, which is set to '05'
     * when the cardholder authenticates OK, and '08' when the cardholder
     * is not enrolled. (These values may change depending on the locale or issuer).
     */
    eci: string;
    /**
     * unique transaction identifier that is generated by the merchant to identify the 3DS transaction.
     */
    xid: string;
    /**
     * This field is only included if the card is within an enrolled range.
     * It will take values (Y - Yes, N - No, U - Unavailable for Checking).
     */
    enrolled: "Y" | "N" | "U";
    /**
     * This field is only included if payment authentication was used and a PARes
     * was received by the MPI. It will take values (Y - Yes, N - No, A - Attempted
     * Authentication, U - Unavailable for Checking).
     */
    status: string;
    /**
     * A date supplied by the acquirer to indicate when this transaction will be settled.
     * If the batch has today's date then it will be settled the next day. When the acquirer
     * closes the batch at the end of the day, the date will roll over to the next processing
     * day's date.
     */
    batchNumber: string;
    /**
     * Indicates the type of transaction type. It must be equal to 'pay'.
     */
    command: string;
    message: string;
    /**
     * The Verification Security Level is generated at the card issuer as a token to prove
     * that the cardholder was enrolled and authenticated OK. It is shown for all transactions
     * except those with authentication status “Failure”. This field contains the security level
     * to be used in the AUTH message. '05' - Fully Authenticated. '06' - Not authenticated,
     * (cardholder not participating), liability shift. '07' - Not authenticated. Usually due
     * to a system problem, for example the merchant password is invalid.
     */
    verSecurityLevel: string;
    /**
     * The status codes used by the Payment Server. response code value to show whether
     * the card authentication was successful or not.
     */
    verStatus: VerStatus;
    verType: "3DS" | "SPA";
    /**
     * this value is generated by the card issuer as a token to prove that the cardholder
     * authenticated OK. This is a base64 encoded value.
     */
    verToken: string;
    /**
     * The version of the Payment Client API being used. The current version is 1.
     */
    version: string;
    /**
     * Mezza receipt number.
     */
    receiptNumber: string;
    /**
     * Hosted checkout session ID. Incase the authentication required a session id.
     */
    sessionId: string;
  };
  invoiceInfo: {
    /**
     * Number of the invoice.
     */
    number: string;
    /**
     * Business Reference Number of the invoice.
     */
    businessRefNumber: string;
    /**
     * Due Date of the invoice.
     */
    dueDate: string;
    /**
     * Expiry Date of the invoice.
     */
    expiryDate: string;
  };
  /**
   * Customer Paid amount as Interest fees
   */
  installmentInterestAmount: number;
  /**
   * Number of Months for the instalment
   */
  installmentMonths: number;
  failureErrorCode: FawryStatusCode;
  failureReason: string;
  /**
   * The SHA-256 digested for the following concatenated string fawryRefNumber + merchantRefNum +
   * Payment amount(in two decimal format 10.00)+Order amount(in two decimal format 10.00)+Order Status +
   * Payment method + Payment reference number ( if exist as in case of notification for order creation this
   * element will be empty) + secureKey
   */
  messageSignature: string;
};
