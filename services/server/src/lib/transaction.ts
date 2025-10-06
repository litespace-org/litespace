import {
  knex,
  transactions,
  txLessonTemps,
  txPlanTemps,
} from "@litespace/models";
import { ILesson, IPlan, ITransaction } from "@litespace/types";
import { price } from "@litespace/utils";

export async function createPaidLessonTx({
  userId,
  amount,
  tutorId,
  slotId,
  start,
  duration,
  paymentMethod,
}: {
  userId: number;
  amount: number;
  tutorId: number;
  slotId: number;
  start: string;
  duration: ILesson.Duration;
  paymentMethod: ITransaction.PaymentMethod;
}): Promise<ITransaction.Self> {
  return await knex.transaction(async (tx) => {
    const transaction = await transactions.create({
      tx,
      userId: userId,
      providerRefNum: null,
      amount: price.scale(amount),
      type: ITransaction.Type.PaidLesson,
      paymentMethod,
    });

    await txLessonTemps.create({
      tx,
      start,
      slotId,
      tutorId,
      duration,
      txId: transaction.id,
    });

    return transaction;
  });
}

export async function createPaidPlanTx({
  userId,
  amount,
  paymentMethod,
  planId,
  planPeriod,
}: {
  userId: number;
  amount: number;
  paymentMethod: ITransaction.PaymentMethod;
  planId: number;
  planPeriod: IPlan.Period;
}) {
  return await knex.transaction(async (tx) => {
    const transaction = await transactions.create({
      tx,
      userId: userId,
      providerRefNum: null,
      amount: price.scale(amount),
      paymentMethod,
      type: ITransaction.Type.PaidPlan,
    });

    await txPlanTemps.create({
      tx,
      planId,
      planPeriod,
      txId: transaction.id,
    });

    return transaction;
  });
}
