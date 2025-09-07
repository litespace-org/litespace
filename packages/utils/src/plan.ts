import { IPlan } from "@litespace/types";
import {
  PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD,
  PLAN_PERIOD_TO_MONTH_COUNT,
  PLAN_PERIOD_TO_WEEK_COUNT,
} from "@/constants";
import { percentage, price } from "@/value";

function asPlanPeriod(
  period: IPlan.Period | IPlan.PeriodLiteral
): IPlan.Period {
  return typeof period == "string"
    ? PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[period]
    : period;
}

/**
 * @returns **scaled** plan period discount
 */
export function getPlanPeriodDiscount(
  plan: IPlan.Self,
  period: IPlan.Period | IPlan.PeriodLiteral
): number {
  const planPeriod = asPlanPeriod(period);

  const map: Record<IPlan.Period, number> = {
    [IPlan.Period.Month]: plan.monthDiscount,
    [IPlan.Period.Quarter]: plan.quarterDiscount,
    [IPlan.Period.Year]: plan.yearDiscount,
    [IPlan.Period.FreeTrial]: 0,
  };

  return map[planPeriod];
}

export function calculateTotalPriceBeforeDiscount(
  /**
   * **scaled** plan monthly price.
   */
  baseMonthlyPrice: number,
  period: IPlan.Period | IPlan.PeriodLiteral
) {
  const planPeriod = asPlanPeriod(period);
  const months = PLAN_PERIOD_TO_MONTH_COUNT[planPeriod];
  return price.unscale(baseMonthlyPrice) * months;
}

export function calculateTotalPriceAfterDiscount(
  plan: IPlan.Self,
  period: IPlan.Period | IPlan.PeriodLiteral
) {
  const discount = percentage.unscale(getPlanPeriodDiscount(plan, period));
  const totalPriceBeforeDiscount = calculateTotalPriceBeforeDiscount(
    plan.baseMonthlyPrice,
    period
  );
  return (totalPriceBeforeDiscount * (100 - discount)) / 100;
}

export function calculateTotalMinutes(
  period: IPlan.Period | IPlan.PeriodLiteral,
  weeklyMinutes: number
): number {
  return PLAN_PERIOD_TO_WEEK_COUNT[asPlanPeriod(period)] * weeklyMinutes;
}
