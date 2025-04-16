import { BaseRequestPayload } from "@/fawry/types/requests";
import { PaymentMethod } from "@/fawry/types/ancillaries";
import { fawryConfig } from "@/constants";
import { IUser } from "@litespace/types";

export function forgeFawryPayload({
  merchantRefNum,
  paymentMethod,
  chargeItems = [],
  description = "",
  signature,
  amount,
  user,
}: {
  chargeItems?: BaseRequestPayload["chargeItems"];
  paymentMethod: PaymentMethod;
  merchantRefNum: number;
  description?: string;
  signature: string;
  user: IUser.Self;
  amount: number;
}): BaseRequestPayload {
  if (user.name === null || user.phone === null)
    throw new Error(
      "User name or phone number is missing; should never happen."
    );

  return {
    merchantRefNum,
    paymentMethod,
    customerProfileId: user.id,
    customerName: user.name,
    customerMobile: user.phone,
    customerEmail: user.email,
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
