import { FieldError } from "@litespace/types";

export function isValidWithdrawMinAmount(
  minAmount: number,
  maxAmount: number
):
  | FieldError.WithdrawMinAmountAboveMaxAmount
  | FieldError.WithdrawMaxAmountZeroOrNegative
  | FieldError.WithdrawMinAmountZeroOrNegative
  | true {
  if (minAmount <= 0) return FieldError.WithdrawMinAmountZeroOrNegative;
  if (maxAmount <= 0) return FieldError.WithdrawMaxAmountZeroOrNegative;
  if (minAmount > maxAmount) return FieldError.WithdrawMinAmountAboveMaxAmount;
  return true;
}
export function isValidWithdrawMaxAmount(
  maxAmount: number,
  minAmount: number
):
  | FieldError.WithdrawMinAmountAboveMaxAmount
  | FieldError.WithdrawMaxAmountZeroOrNegative
  | FieldError.WithdrawMinAmountZeroOrNegative
  | true {
  if (maxAmount <= 0) return FieldError.WithdrawMaxAmountZeroOrNegative;
  if (minAmount <= 0) return FieldError.WithdrawMinAmountZeroOrNegative;
  if (minAmount > maxAmount) return FieldError.WithdrawMinAmountAboveMaxAmount;
  return true;
}
