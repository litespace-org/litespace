import {
  MINUTES_IN_HOUR,
  MONTHS_IN_QUARTER,
  MONTHS_IN_YEAR,
  WEEKS_PER_MONTH,
  WEEKS_IN_QUARTER,
  WEEKS_IN_YEAR,
} from "@litespace/utils";
import { PlanDuration } from "@/components/PlansV2";

export function getHoursLabel(value: number) {
  if (value <= 10 && value >= 3) return "plan.labels.hours";
  return "plan.labels.hour";
}

/**
 * @param value Num of minutes per week
 */
export function getMonthlyHours(value: number) {
  const hoursPerWeek = value / MINUTES_IN_HOUR;
  const hoursPerMonth = hoursPerWeek * WEEKS_PER_MONTH;

  return hoursPerMonth;
}

/**
 * @param value Num of minutes per week
 */
export function getQuarterHours(value: number) {
  const hoursPerWeek = value / MINUTES_IN_HOUR;
  const hoursPerQuarter = hoursPerWeek * WEEKS_IN_QUARTER;

  return hoursPerQuarter;
}

/**
 * @param value Num of minutes per week
 */
export function getAnnualHours(value: number) {
  const hoursPerWeek = value / MINUTES_IN_HOUR;
  const hoursPerYear = hoursPerWeek * WEEKS_IN_YEAR;

  return hoursPerYear;
}

/**
 * @param value The price before the discount
 * @param discount The percent of the discount
 * @param category The category of the plan wheather monthly or 3 months or year
 */
export function getPriceAfterDiscount(
  value: number,
  discount: number,
  category: PlanDuration
) {
  const monthlyPriceAfterDiscount = (value * (100 - discount)) / 100;
  const quarterPriceAfterDiscount =
    (value * MONTHS_IN_QUARTER * (100 - discount)) / 100;
  const annualPriceAfterDiscount =
    (value * MONTHS_IN_YEAR * (100 - discount)) / 100;

  if (category === "month") return monthlyPriceAfterDiscount;
  if (category === "quarter") return quarterPriceAfterDiscount;
  return annualPriceAfterDiscount;
}

export function getPlanCost(value: number, duration: PlanDuration) {
  if (duration === "month") return value;
  if (duration === "quarter") return value * MONTHS_IN_QUARTER;
  return value * MONTHS_IN_YEAR;
}
