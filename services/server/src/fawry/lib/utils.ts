import { fawryConfig } from "@/constants";
import { PaymentMethod } from "@/fawry/types/ancillaries";
import { BaseRequestPayload, Customer } from "@/fawry/types/requests";

export function forgeFawryPayload({
  merchantRefNum,
  paymentMethod,
  chargeItems = [],
  description,
  signature,
  amount,
  customer,
}: {
  chargeItems?: BaseRequestPayload["chargeItems"];
  paymentMethod: PaymentMethod;
  merchantRefNum: number;
  description: string;
  signature: string;
  customer: Customer;
  amount: number;
}): BaseRequestPayload {
  return {
    merchantRefNum,
    paymentMethod,
    customerProfileId: customer.id,
    customerName: customer.name,
    customerMobile: customer.phone,
    customerEmail: customer.email,
    chargeItems,
    description,
    currencyCode: "EGP",
    language: "ar-eg",
    merchantCode: fawryConfig.merchantCode,
    signature,
    amount,
  };
}
