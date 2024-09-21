import { LocalMap, messages } from "@/locales";
import { IWithdrawMethod } from "@litespace/types";

export function destructureWithdrawMethod(method: IWithdrawMethod.Type) {
  return {
    bank: method === IWithdrawMethod.Type.Bank,
    instapay: method === IWithdrawMethod.Type.Instapay,
    wallet: method === IWithdrawMethod.Type.Wallet,
  };
}

export function getWithdrawMethodIntlId(
  method: IWithdrawMethod.Type
): keyof LocalMap {
  const { bank, instapay } = destructureWithdrawMethod(method);
  return instapay
    ? messages["withdraw.methods.instapay"]
    : bank
      ? messages["withdraw.methods.bank"]
      : messages["withdraw.methods.wallet"];
}
