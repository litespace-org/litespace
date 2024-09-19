import { IWithdrawMethod } from "@litespace/types";

export function isValidWithdrawMethod(
  amount: number,
  method: IWithdrawMethod.Self
): boolean {
  return amount > method.min && amount < method.max && method.enabled;
}
