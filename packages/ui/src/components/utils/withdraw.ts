import { LocalMap, messages } from "@/locales";
import { IInvoice } from "@litespace/types";

export function destructureWithdrawMethod(method: IInvoice.WithdrawMethod) {
  return {
    bank: method === IInvoice.WithdrawMethod.Bank,
    instapay: method === IInvoice.WithdrawMethod.Instapay,
    wallet: method === IInvoice.WithdrawMethod.Wallet,
  };
}

export function getWithdrawMethodIntlId(
  method: IInvoice.WithdrawMethod
): keyof LocalMap {
  const { bank, instapay } = destructureWithdrawMethod(method);
  return instapay
    ? messages["withdraw.methods.instapay"]
    : bank
      ? messages["withdraw.methods.bank"]
      : messages["withdraw.methods.wallet"];
}
