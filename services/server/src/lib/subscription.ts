import dayjs from "@/lib/dayjs";
import { lessons, subscriptions } from "@litespace/models";
import { first } from "lodash";
import { getCurrentWeekBoundaries } from "@litespace/utils/subscription";

export async function calculateRemainingWeeklyMinutesOfCurrentWeekBySubscription({
  start,
  weeklyMinutes,
  userId,
}: {
  start: string;
  weeklyMinutes: number;
  userId: number;
}) {
  const week = getCurrentWeekBoundaries(start);

  const minutes = await lessons.sumDuration({
    users: [userId],
    after: week.start,
    before: week.end,
    canceled: false,
    ratified: true,
  });

  if (minutes > weeklyMinutes) return 0;
  return weeklyMinutes - minutes;
}

export async function calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(
  userId: number
) {
  const { list } = await subscriptions.find({
    users: [userId],
    // exclude terminated subscriptions (e.g., refuned)
    terminated: false,
    // include only subscriptions that have not yet ended.
    end: { after: dayjs.utc().toISOString() },
  });

  const subscription = first(list);
  if (!subscription) return 0;

  return calculateRemainingWeeklyMinutesOfCurrentWeekBySubscription({
    start: subscription.start,
    weeklyMinutes: subscription.weeklyMinutes,
    userId: subscription.userId,
  });
}
