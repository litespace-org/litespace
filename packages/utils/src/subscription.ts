import { dayjs } from "@/dayjs";
import { DAYS_IN_WEEK } from "@/constants";

/**
 * @param start subscription start is iso datetime string.
 * @returns zero-based index of the current week relative to the subscription start.
 * @note it will return -1 incase the subscription hasn't started yet.
 */
export function getCurrentWeekIndex(start: string) {
  const now = dayjs.utc().endOf("day");
  if (now.isBefore(start)) return -1;
  const days = now.diff(start, "days");
  const week = days / DAYS_IN_WEEK;
  return Math.floor(week);
}

/**
 * @returns subscription week count.
 * @note it will return 0 in case the `start` is after the `end`.
 */
export function getWeekCount(subscription: { start: string; end: string }) {
  const start = dayjs.utc(subscription.start);
  const end = dayjs.utc(subscription.end);
  if (start.isAfter(end)) return 0;
  const days = end.diff(start, "days");
  const count = days / DAYS_IN_WEEK;
  return Math.floor(count);
}

/**
 * @param start subscription start is iso datetime string.
 */
export function getCurrentWeekBoundaries(start: string): {
  /**
   * week start in as iso datetime string.
   */
  start: string;
  /**
   * week end in as iso datetime string.
   */
  end: string;
} {
  const subscriptionStart = dayjs.utc(start).startOf("day");
  const weekIndex = getCurrentWeekIndex(start);
  const weekStart = subscriptionStart.add(weekIndex, "week");
  const weekEnd = weekStart.add(6, "days").endOf("day");
  return {
    start: weekStart.toISOString(),
    end: weekEnd.toISOString(),
  };
}
