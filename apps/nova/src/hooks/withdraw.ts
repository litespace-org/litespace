import { IWithdrawMethod } from "@litespace/types";
import { useMemo } from "react";

export function useWithdrawMethod(method: IWithdrawMethod.Type) {
  return useMemo(
    () => ({
      bank: method === IWithdrawMethod.Type.Bank,
      instapay: method === IWithdrawMethod.Type.Instapay,
      wallet: method === IWithdrawMethod.Type.Wallet,
    }),
    [method]
  );
}
