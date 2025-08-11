import { paymobConfig } from "@/constants";
import { IPaymob, ITransaction } from "@litespace/types";

export function getCheckoutPageUrl(clientSecret: string): string {
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${paymobConfig.publicKey}&clientSecret=${clientSecret}`;
}

export function paymentMethodToIntegration(
  paymentMethod: ITransaction.PaymentMethod
) {
  if (paymentMethod === ITransaction.PaymentMethod.Card)
    return IPaymob.PaymobIntegrationIds.Card;
  if (paymentMethod === ITransaction.PaymentMethod.EWallet)
    return IPaymob.PaymobIntegrationIds.Ewallet;
  return null;
}
