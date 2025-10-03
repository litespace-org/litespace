import dayjs from "@/lib/dayjs";
import {
  knex,
  lessons,
  plans,
  subscriptions,
  transactions,
  txPlanTemp,
} from "@litespace/models";
import { first } from "lodash";
import {
  getCurrentWeekBoundaries,
  getPseudoWeekBoundaries,
  isPseudoSubscription,
} from "@litespace/utils/subscription";
import { IPlan, ISubscription, ITransaction } from "@litespace/types";
import {
  PLAN_PERIOD_TO_MONTH_COUNT,
  STUDENT_FREE_WEEKLY_MINUTES,
} from "@litespace/utils";
import { PLAN_PERIOD_TO_WEEK_COUNT } from "node_modules/@litespace/utils/dist/esm";

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
    reported: false,
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

export async function upsertSubscriptionByTxStatus({
  txId,
  userId,
  status,
  fawryRefNumber,
}: {
  txId: number;
  userId: number;
  status: ITransaction.Status;
  fawryRefNumber: string;
}) {
  const subscription = await subscriptions.findByTxId(txId);
  const now = dayjs.utc();

  await knex.transaction(async (tx) => {
    // Update the transaction with the latest status.
    await transactions.update(
      txId,
      {
        status:
          status === ITransaction.Status.New
            ? ITransaction.Status.Processed
            : status,
        providerRefNum: fawryRefNumber,
      },
      tx
    );

    // Terminate subscription in case the tx was canceled, refunded, or failed.
    if (
      subscription &&
      (status === ITransaction.Status.Canceled ||
        status === ITransaction.Status.Refunded ||
        status === ITransaction.Status.Failed)
    )
      return await subscriptions.update(subscription.id, {
        terminatedAt: now.toISOString(),
      });

    if (!subscription && status === ITransaction.Status.Paid) {
      await knex.transaction(async (tx) => {
        const txPlan = await txPlanTemp.findByTxId({ tx, txId });
        if (!txPlan) throw new Error("Temporary plan data not found.");

        const plan = await plans.findById(txPlan.planId);
        if (!plan) throw new Error("Plan not found");

        const weekCount = PLAN_PERIOD_TO_WEEK_COUNT[txPlan.planPeriod];
        const end = now.add(weekCount, "week");

        await subscriptions.create({
          tx,
          txId,
          userId,
          period: txPlan.planPeriod,
          planId: txPlan.planId,
          weeklyMinutes: plan.weeklyMinutes,
          start: now.toISOString(),
          end: end.toISOString(),
        });

        await txPlanTemp.delete({ tx, txId });
      });
    }
  });
}
