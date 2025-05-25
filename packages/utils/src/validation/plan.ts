import {
  MAX_PLAN_DISCOUNT_SCALED,
  MIN_PLAN_DISCOUNT_SCALED,
  MAX_PLAN_WEEKLY_MINUTES,
  MIN_PLAN_WEEKLY_MINUTES,
} from "@/constants";
import { FieldError, IPlan, Optional } from "@litespace/types";
import { isFinite, isInteger } from "lodash";

export function validatePlanWeeklyMinutes(
  weeklyMinutes: number
): Optional<FieldError.PlanWeeklyMinutesOutOfRange> {
  if (
    weeklyMinutes > MAX_PLAN_WEEKLY_MINUTES ||
    weeklyMinutes < MIN_PLAN_WEEKLY_MINUTES
  )
    return FieldError.PlanWeeklyMinutesOutOfRange;
}

export function validatePlanPrice(
  /**
   * scaled price
   */
  price: number
): Optional<FieldError.InvalidPlanPrice> {
  if (price <= 0 || !isInteger(price) || isNaN(price) || !isFinite(price))
    return FieldError.InvalidPlanPrice;
}

export function validatePlanDiscount(
  /**
   * scaled discount
   */
  discount: number
): Optional<FieldError.PlanDiscountOutOfRange> {
  if (
    discount < MIN_PLAN_DISCOUNT_SCALED ||
    discount > MAX_PLAN_DISCOUNT_SCALED
  )
    return FieldError.PlanDiscountOutOfRange;
}

export function isValidPlanPeriodLiteral(
  period: string
): period is IPlan.PeriodLiteral {
  return period === "month" || period === "quarter" || period === "year";
}
