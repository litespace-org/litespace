import { destructureWithdrawMethod } from "@/components/utils/withdraw";
import { IWithdrawMethod } from "@litespace/types";
import { useMemo } from "react";

export function useWithdrawMethod(method: IWithdrawMethod.Type) {
  return useMemo(() => destructureWithdrawMethod(method), [method]);
}
