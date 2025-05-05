import {
  OrderStatus,
  PaymentMethod,
  PaymentDetails,
} from "@/fawry/types/ancillaries";
import { CancelPaymentErrorCode, FawryStatusCode } from "@/fawry/types/errors";

type Base = {
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

type ErrorResponse = {
  /**
   * Specific type of the response.
   * Example: "PaymentStatusResponse", "ChargeResponse", etc.
   */
  type: string;
  /**
   * The response status code.
   */
  statusCode: Exclude<FawryStatusCode, 200>;
  /**
   * Exact description of the status of FawryPay response.
   */
  statusDescription: string;
};

type SuccessResponse = {
  statusCode: 200;
  statusDescription: string;
};

export type PayWithCard =
  | (SuccessResponse & {
      nextAction: {
        /**
         * Redirect url for you to redirect your client for payment authentication.
         */
        redirectUrl: string;
        /**
         * The type of response.
         * Example: "THREE_D_SECURE"
         */
        type: string;
      };
    })
  | ErrorResponse;

export type PayWithEWallet =
  | (SuccessResponse & {
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
      walletQr?: string;
    })
  | ErrorResponse;

export type PayWithRefNum = Base & {
  /**
   * FawryPay issued transaction reference number.
   */
  referenceNumber?: string;
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

export type PayWithCardAndBankInstallments = PayWithRefNum & {
  /**
   * Payment authentication number.
   * Example: 12336534
   */
  authNumber: string;
};

export type RefundResponse = Base & {};

export type CreateCardTokenResponse = Base & {
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

export type ListCardTokens =
  | (SuccessResponse & {
      cards: Array<{
        isDefault: boolean;
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
         * The first six digits of the card
         */
        firstSixDigits: number;
        /**
         * The card issuer brand name
         */
        brand: string;
        cardHolderName: string;
        accountTypeCode: string;
      }>;
    })
  | ErrorResponse;

export type DeleteCardTokenResponse = SuccessResponse | ErrorResponse;

export type CancelUnpaidOrderResponse = {
  code: CancelPaymentErrorCode;
  description: string;
  reason: string;
};

export type AuthorizePayment = PayWithRefNum & {};

export type CapturePaymentResponse = Base & {
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

export type CancelPaymentAuth = Base & {
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

export type GetPaymentStatus = PaymentDetails;
