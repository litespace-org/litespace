import {
  MAX_PLAN_ALIAS_LENGTH,
  MAX_PLAN_DISCOUNT,
  MAX_PLAN_WEEKLY_MINUTES,
  MIN_PLAN_ALIAS_LENGTH,
  MIN_PLAN_DISCOUNT,
  MIN_PLAN_WEEKLY_MINUTES,
} from "@/constants";
import { FieldError, IPlan } from "@litespace/types";

export function isValidPlanAlias(
  planAlias: string
): FieldError.TooLongPlanAlias | FieldError.TooShortPlanAlias | true {
  if (planAlias.length > MAX_PLAN_ALIAS_LENGTH)
    return FieldError.TooLongPlanAlias;
  if (planAlias.length < MIN_PLAN_ALIAS_LENGTH)
    return FieldError.TooShortPlanAlias;
  return true;
}
export function isValidPlanWeeklyMinutes(
  weeklyMinutes: number
):
  | FieldError.MaxPlanWeeklyMinutesExceeded
  | FieldError.EmptyPlanWeeklyMinutes
  | true {
  if (weeklyMinutes > MAX_PLAN_WEEKLY_MINUTES)
    return FieldError.MaxPlanWeeklyMinutesExceeded;
  if (weeklyMinutes <= MIN_PLAN_WEEKLY_MINUTES)
    return FieldError.EmptyPlanWeeklyMinutes;
  return true;
}
export function isValidPrice(
  price: number
):
  | FieldError.ZeroPlanPrice
  | FieldError.InfinitePlanPrice
  | FieldError.PlanPriceNotInteger
  | true {
  if (price <= 0) return FieldError.ZeroPlanPrice;
  if (!Number.isFinite(price)) return FieldError.InfinitePlanPrice;
  if (!Number.isInteger(price)) return FieldError.PlanPriceNotInteger;
  return true;
}
export function isValidPlanPrice(
  price: number,
  discount: number
):
  | FieldError.ZeroPlanPrice
  | FieldError.InfinitePlanPrice
  | FieldError.PlanTotalDiscount
  | FieldError.PlanPriceNotInteger
  | true {
  const priceAfterDiscount = price - (price * discount) / 100;

  if (price <= 0) return FieldError.ZeroPlanPrice;
  if (!Number.isFinite(price)) return FieldError.InfinitePlanPrice;
  if (priceAfterDiscount <= 0) return FieldError.PlanTotalDiscount;
  if (!Number.isInteger(price)) return FieldError.PlanPriceNotInteger;
  return true;
}
export function isValidPlanDiscount(
  discount: number
):
  | FieldError.MinPlanDiscountSubceeded
  | FieldError.MaxPlanDiscountExceeded
  | true {
  if (discount < MIN_PLAN_DISCOUNT) return FieldError.MinPlanDiscountSubceeded;
  if (discount > MAX_PLAN_DISCOUNT) return FieldError.MaxPlanDiscountExceeded;
  return true;
}

export function isValidPlanPeriodLiteral(
  period: string
): period is IPlan.PeriodLiteral {
  return period === "month" || period === "quarter" || period === "year";
}
