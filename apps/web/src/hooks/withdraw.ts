import { IInvoice } from "@litespace/types";
import { useMemo } from "react";

export function useWithdrawMethod(method: IInvoice.WithdrawMethod) {
  return useMemo(
    () => ({
      bank: method === IInvoice.WithdrawMethod.Bank,
      instapay: method === IInvoice.WithdrawMethod.Instapay,
      wallet: method === IInvoice.WithdrawMethod.Wallet,
    }),
    [method]
  );
}
