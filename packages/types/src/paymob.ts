import { IPlan, ITransaction } from "@/index";

export type CreateCheckoutUrlApiPayload = {
  planId: number;
  planPeriod: IPlan.Period;
  paymentMethod:
    | ITransaction.PaymentMethod.Card
    | ITransaction.PaymentMethod.EWallet;
};

export type CreateCheckoutUrlApiResponse = {
  checkoutUrl: string;
};

/**
 * the integration name or id
 */
export type PaymobIntegration = string | number;

export type PaymentInfo = {
  paymentMethods: Array<PaymobIntegration>;
  specialReference: string;

  items: Array<{
    name: string;
    amount: number;
    description: string;
    quantity: number;
  }>;

  billingData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
};

export type IntentionApiPayload = {
  /**
   * amount of money in cents
   */
  amount: number;
  currency: "EGP";
  payment_methods: Array<PaymobIntegration>;
  items: Array<{
    name: string;
    amount: number;
    description: string;
    quantity: number;
  }>;
  billing_data: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
  special_reference?: string;
  expiration?: number;
  notification_url?: string;
  redirection_url?: string;
};

// https://developers.paymob.com/egypt/api-reference-guide/create-intention-payment-api
export type IntentionApiResponse = {
  client_secret: string;
};

// https://developers.paymob.com/egypt/api-reference-guide/create-intention-payment-api#Webhook-Responses
export type WebhookResponse = {
  hmac: string;
  intention: {
    id: string;
    intention_detail: {
      amount: number;
      currency: string;
      billingData: {
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
      };
    };
    special_reference: string;
  };
  transaction: {
    id: number;
    pending: boolean;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_refunded: boolean;
    integration_id: number;
    created_at: string;
    order: { id: number };
  };
};
