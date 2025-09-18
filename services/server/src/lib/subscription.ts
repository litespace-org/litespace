import dayjs from "@/lib/dayjs";
import { lessons, subscriptions } from "@litespace/models";
import { first } from "lodash";
import {
  getCurrentWeekBoundaries,
  getPseudoWeekBoundaries,
  isPseudoSubscription,
} from "@litespace/utils/subscription";
import { IPlan, ISubscription } from "@litespace/types";
import {
  PLAN_PERIOD_TO_MONTH_COUNT,
  STUDENT_FREE_WEEKLY_MINUTES,
} from "@litespace/utils";

export async function calcRemainingWeeklyMinutesBySubscription(
  sub: ISubscription.Self
) {
  const week = isPseudoSubscription(sub)
    ? getPseudoWeekBoundaries()
    : getCurrentWeekBoundaries(sub.start);

  const minutes = await lessons.sumDuration({
    users: [sub.userId],
    after: isPseudoSubscription(sub) ? sub.start : week.start,
    before: week.end,
    canceled: false,
    ratified: true,
  });

  if (minutes > sub.weeklyMinutes) return 0;
  return sub.weeklyMinutes - minutes;
}

export async function calcRemainingWeeklyMinutesByUserId(userId: number) {
  const { list } = await subscriptions.find({
    users: [userId],
    // exclude terminated subscriptions (e.g., refuned)
    terminated: false,
    // include only subscriptions that have not yet ended.
    end: { after: dayjs.utc().toISOString() },
  });

  const subscription = first(list);
  if (!subscription) return 0;

  return calcRemainingWeeklyMinutesBySubscription(subscription);
}

export async function isUserSubscribed(userId: number): Promise<boolean> {
  const sub = await subscriptions.find({
    users: [userId],
    terminated: false,
    end: { after: dayjs.utc().toISOString() },
  });
  return !!first(sub.list);
}

export function generateFreeSubscription({
  userId,
  userCreatedAt,
}: {
  userId: number;
  userCreatedAt: string;
}): ISubscription.Self {
  return {
    id: -1,
    userId,
    planId: -1,
    txId: -1,
    period: IPlan.Period.FreeTrial,
    weeklyMinutes: STUDENT_FREE_WEEKLY_MINUTES,
    start: userCreatedAt,
    end: dayjs(userCreatedAt)
      .add(PLAN_PERIOD_TO_MONTH_COUNT[IPlan.Period.FreeTrial], "month")
      .toISOString(),
    extendedBy: null,
    terminatedAt: null,
    terminatedBy: null,
    createdAt: userCreatedAt,
    updatedAt: userCreatedAt,
  };
}
