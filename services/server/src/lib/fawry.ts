import { BaseRequestPayload } from "@/fawry/types/requests";
import { PaymentMethod } from "@/fawry/types/ancillaries";
import { fawryConfig } from "@/constants";
import { IUser } from "@litespace/types";

export function forgeFawryPayload({
  merchantRefNum,
  amount,
  paymentMethod,
  user,
  chargeItems,
  description,
  orderWebHookUrl,
}: {
  merchantRefNum: number;
  amount: number;
  paymentMethod: PaymentMethod;
  user: IUser.Self;
  signature?: string;
  chargeItems?: BaseRequestPayload["chargeItems"];
  description?: string;
  orderWebHookUrl?: string;
}): Omit<BaseRequestPayload, "signature"> | Error {
  if (user.name === null || user.phone === null) {
    return new Error("username and phone cannot be null.");
  }
  return {
    merchantRefNum,
    paymentMethod,
    amount,

    customerProfileId: user.id,
    customerName: user.name,
    customerMobile: user.phone,
    customerEmail: user.email,

    chargeItems: chargeItems || [
      {
        itemId: "LiteSpace Subscription",
        description: "",
        price: amount,
        quantity: 1,
      },
    ],
    description: description || "",
    orderWebHookUrl,

    currencyCode: "EGP",
    language: "ar-eg",
    merchantCode: fawryConfig.merchantCode,
  };
}
