import { environment, paymobConfig } from "@/constants";
import { ITransaction } from "@litespace/types";
import dayjs from "dayjs";

export function getCheckoutPageUrl(clientSecret: string): string {
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${paymobConfig.publicKey}&clientSecret=${clientSecret}`;
}

export function paymentMethodToIntegration(
  paymentMethod: ITransaction.PaymentMethod
) {
  if (paymentMethod === ITransaction.PaymentMethod.Card)
    return paymobConfig.integrationIds.card;
  if (paymentMethod === ITransaction.PaymentMethod.EWallet)
    return paymobConfig.integrationIds.ewallet;
  return null;
}

export function encodeSpecialRefernce({
  transactionId,
  createdAt,
}: {
  transactionId: number;
  createdAt: string;
}) {
  if (environment === "production") return transactionId.toString();
  const seconds = dayjs.utc(createdAt).unix();
  return seconds + "-" + transactionId.toString();
}

export function decodeSpecialReference(specialReference: string) {
  if (environment === "production") return Number(specialReference);
  const transactionId = specialReference.split("-")[1];
  return Number(transactionId);
}
