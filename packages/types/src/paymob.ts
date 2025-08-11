import { IPlan, ITransaction } from "@/index";

// copied from paymob dashboard; Developers -> Payment Integrations.
export enum PaymobIntegrationIds {
  Ewallet = 5225743,
  Card = 4358466,
}

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

export type PaymentInfo = {
  paymentMethods: Array<PaymobIntegrationIds>;
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

// https://developers.paymob.com/egypt/api-reference-guide/create-intention-payment-api
export type IntentionApiResponse = {
  client_secret: string;
};

// https://developers.paymob.com/egypt/api-reference-guide/create-intention-payment-api#Webhook-Responses
export type WebhookResponse = {
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

  hmac: string;

  transaction: {
    id: number;
    pending: boolean;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_refunded: boolean;
    integration_id: PaymobIntegrationIds;
    created_at: string;
    order: { id: number };
  };
};
