import { BaseRequestPayload, Customer } from "@/fawry/types/requests";
import { PaymentMethod } from "@/fawry/types/ancillaries";
import { fawryConfig } from "@/constants";

export function forgeFawryPayload({
  merchantRefNum,
  paymentMethod,
  chargeItems = [],
  description = "",
  signature,
  amount,
  customer,
}: {
  chargeItems?: BaseRequestPayload["chargeItems"];
  paymentMethod: PaymentMethod;
  merchantRefNum: number;
  description?: string;
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
    orderWebHookUrl: "/todo",
    currencyCode: "EGP",
    language: "ar-eg",
    amount,
    merchantCode: fawryConfig.merchantCode,
    signature,
  };
}
