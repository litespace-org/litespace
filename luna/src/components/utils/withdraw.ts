import { messages } from "@/locales";
import { IWithdrawMethod } from "@litespace/types";

export function destructureWithdrawMethod(method: IWithdrawMethod.Type) {
  return {
    bank: method === IWithdrawMethod.Type.Bank,
    instapay: method === IWithdrawMethod.Type.Instapay,
    wallet: method === IWithdrawMethod.Type.Wallet,
  };
}

export function getWithdrawMethodIntlId(method: IWithdrawMethod.Type) {
  const { bank, instapay } = destructureWithdrawMethod(method);
  return instapay
    ? messages["global.withdraw.methods.instapay"]
    : bank
      ? messages["global.withdraw.methods.bank"]
      : messages["global.withdraw.methods.wallet"];
}
