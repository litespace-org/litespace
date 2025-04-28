import { ISubscription } from "@litespace/types";
import { DAYS_IN_WEEK, MIN_LESSON_DURATION } from "@litespace/utils";
import dayjs from "@/lib/dayjs";
import { lessons, subscriptions } from "@litespace/models";
import { first } from "lodash";

export function calcualteWeeklyMinutesOfCurrentWeek({
  subscription,
  weeklyMinutes,
  time,
}: {
  subscription: {
    start: string;
    end: string;
  };
  time: string;
  weeklyMinutes: number;
}) {
  const subscriptionStart = dayjs.utc(subscription.start);
  const subscriptionEnd = dayjs.utc(subscription.end);
  const weekStart = dayjs.utc(time).startOf("week");
  const weekEnd = weekStart.endOf("week");
  const userSubscribedThisWeek = weekStart.isBefore(subscriptionStart);
  const userSubscriptionEndsThisWeek = weekEnd.isAfter(subscriptionEnd);

  if (userSubscribedThisWeek || userSubscriptionEndsThisWeek) {
    const day = userSubscribedThisWeek
      ? subscriptionStart.day()
      : subscriptionEnd.day();
    /**
     * NOTE: atm the week starts on sunday (index = 0). It might change in the
     * future.
     *
     * Incase the user subscribed this week, we count the remaining days in the
     * current week (DAYS_IN_WEEK - DAY_INDEX). For example, if the user
     * subscribed on friday, he will have friday and saturday remaining in the
     * current week.
     *
     * Incase the user subscription will end this week, we count the days from
     * the start of the week (DAY_INDEX + 1). For example, if the user
     * subscription will end on wednesday, he will have from sunday till
     * wednesday (4 days).
     */
    const availableDays = userSubscribedThisWeek ? DAYS_IN_WEEK - day : day + 1;
    /**
     * The percentage is the count of available days divided by the days of the
     * week (7). For example, if the user have 4 days available in the current
     * week then he can get 4/7 of the weekly minutes in his current
     * subscription.
     */
    const percentage = availableDays / DAYS_IN_WEEK;
    const minutes = percentage * weeklyMinutes;
    /**
     * Rounded down the available minutes to make sure it is spendable and there
     * is not reminder. For example, 34 minutes will be rounded to just 30
     * (divided by 15).
     */
    const rounded =
      Math.floor(minutes / MIN_LESSON_DURATION) * MIN_LESSON_DURATION;
    return rounded;
  }

  return weeklyMinutes;
}

export async function calculateRemainingWeeklyMinutesOfCurrentWeekBySubscription({
  subscription,
  time,
}: {
  subscription: ISubscription.Self;
  time: string;
}) {
  const weekStart = dayjs.utc(time).startOf("week");
  const weekEnd = weekStart.endOf("week");
  const userId = subscription.userId;

  const minutes = await lessons.sumDuration({
    users: [userId],
    after: weekStart.toISOString(),
    before: weekEnd.toISOString(),
    canceled: false,
    ratified: true,
  });

  const weeklyMinutes = calcualteWeeklyMinutesOfCurrentWeek({
    subscription: {
      start: subscription.start,
      end: subscription.end,
    },
    weeklyMinutes: subscription.weeklyMinutes,
    time,
  });

  if (minutes > weeklyMinutes) return 0;
  return weeklyMinutes - minutes;
}

export async function calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
  userId,
  time,
}: {
  userId: number;
  time: string;
}) {
  const weekStart = dayjs.utc(time).startOf("week");
  const { list } = await subscriptions.find({
    users: [userId],
    // exclude terminated subscriptions (e.g., refuned)
    terminated: false,
    // include only subscriptions that have not yet ended.
    end: { after: weekStart.toISOString() },
  });

  const subscription = first(list);
  if (!subscription) return 0;

  return calculateRemainingWeeklyMinutesOfCurrentWeekBySubscription({
    subscription,
    time,
  });
}
