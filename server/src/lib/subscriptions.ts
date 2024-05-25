import { Subscription } from "@/models";
import { Dayjs } from "dayjs";

export function calculateSubscriptionEndDate(
  start: Dayjs,
  period: Subscription.Period
): Dayjs {
  if (period === Subscription.Period.Month) return start.add(1, "month");
  if (period === Subscription.Period.Quarter) return start.add(3, "months");
  return start.add(1, "year");
}
