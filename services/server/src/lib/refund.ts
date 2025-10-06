import { platformConfig } from "@/constants";
import { lessons, subscriptions } from "@litespace/models";
import { ITransaction } from "@litespace/types";
import { dayjs, MINUTES_IN_HOUR, price, ResponseError } from "@litespace/utils";
import { max } from "lodash";
import { notfound, unexpected } from "@/lib/error/api";
import { getCurrentWeekBoundaries } from "@litespace/utils/subscription";

/**
 * as described here: https://handbook.litespace.org/s/business/p/refund-policy-oc66GtTqeX
 */
export async function calcRefundAmount(
  tx: Pick<ITransaction.Self, "id" | "amount" | "type" | "userId">,
  txFees: number
): Promise<number | ResponseError> {
  // 1) get the paid amount from the transaction
  const paidAmount = price.unscale(tx.amount);

  if (tx.type === ITransaction.Type.PaidLesson)
    return max([paidAmount - txFees, 0]) || 0;

  // 2) calculate the minutes attended in the current week of the subscription
  // and evaluate the corresponding price.
  const sub = await subscriptions.findByTxId(tx.id);
  if (!sub) return notfound.subscription();
  if (dayjs().isBefore(sub.start)) return unexpected();

  const weekBoundaries = getCurrentWeekBoundaries(sub.start);
  const weekAttendedMinutes = await lessons.sumDuration({
    users: [tx.userId],
    after: weekBoundaries.start,
    before: dayjs().endOf("day").toISOString(),
    canceled: false,
    reported: false,
  });
  const attendedHours = weekAttendedMinutes / MINUTES_IN_HOUR;
  const thisWeekPrice = attendedHours * platformConfig.totalHourlyRate;

  // 3) calculate the number of hours already spend of the sub
  // and evaluate the corresponding price.
  const hourPerWeek = sub.weeklyMinutes / MINUTES_IN_HOUR;
  const numOfWeeks = dayjs().diff(sub.start, "week");
  const totalHours = hourPerWeek * numOfWeeks;
  const prevWeeksPrice = totalHours * platformConfig.totalHourlyRate;

  // 4) calculate the refund amount
  const refundAmount = paidAmount - thisWeekPrice - prevWeeksPrice - txFees;

  return max([refundAmount, 0]) || 0;
}
