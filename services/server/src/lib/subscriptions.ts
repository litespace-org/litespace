import { ISubscription } from "@litespace/types";
import { Dayjs } from "dayjs";

export function calculateSubscriptionEndDate(
  start: Dayjs,
  period: ISubscription.Period
): Dayjs {
  if (period === ISubscription.Period.Month) return start.add(1, "month");
  if (period === ISubscription.Period.Quarter) return start.add(3, "months");
  return start.add(1, "year");
}
