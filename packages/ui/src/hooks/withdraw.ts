import { destructureWithdrawMethod } from "@/components/utils/withdraw";
import { IInvoice } from "@litespace/types";
import { useMemo } from "react";

export function useWithdrawMethod(method: IInvoice.WithdrawMethod) {
  return useMemo(() => destructureWithdrawMethod(method), [method]);
}
