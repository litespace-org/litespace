import { IPlan } from "@litespace/types";
import { percentage, PLAN_PERIOD_TO_MONTH_COUNT } from "@litespace/utils";

export function getPeriodDicount(plan: IPlan.Self, period: IPlan.Period) {
  if (period === IPlan.Period.Month) return plan.monthDiscount;
  if (period === IPlan.Period.Quarter) return plan.quarterDiscount;
  return plan.yearDiscount;
}

export function calculatePlanPrice({
  period,
  plan,
}: {
  period: IPlan.Period;
  plan: IPlan.Self;
}) {
  const monthCount = PLAN_PERIOD_TO_MONTH_COUNT[period];
  const discount = percentage.unscale(getPeriodDicount(plan, period));
  const monthPrice = plan.baseMonthlyPrice;
  const total = monthPrice * monthCount * ((100 - discount) / 100);
  return total;
}
