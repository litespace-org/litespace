import { IPlan } from "@litespace/types";
import { PLAN_PERIOD_TO_WEEK_COUNT } from "@litespace/utils";

export function evaluateTotalMinutes(
  period?: IPlan.Period,
  weeklyMinutes?: number
): number {
  if (!period || !weeklyMinutes) return 0;
  return PLAN_PERIOD_TO_WEEK_COUNT[period] * weeklyMinutes;
}
