import {
  knex,
  transactions,
  txLessonTemp,
  txPlanTemp,
} from "@litespace/models";
import { ILesson, IPlan, ITransaction } from "@litespace/types";

export async function createPaidLessonTx({
  userId,
  scaledAmount,
  tutorId,
  slotId,
  start,
  duration,
  paymentMethod,
}: {
  userId: number;
  scaledAmount: number;
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
      amount: scaledAmount,
      type: ITransaction.Type.PaidLesson,
      paymentMethod,
    });

    await txLessonTemp.create({
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
  scaledAmount,
  paymentMethod,
  planId,
  planPeriod,
}: {
  userId: number;
  scaledAmount: number;
  paymentMethod: ITransaction.PaymentMethod;
  planId: number;
  planPeriod: IPlan.Period;
}) {
  return await knex.transaction(async (tx) => {
    const transaction = await transactions.create({
      tx,
      userId: userId,
      providerRefNum: null,
      amount: scaledAmount,
      paymentMethod,
      type: ITransaction.Type.PaidPlan,
    });

    await txPlanTemp.create({
      tx,
      planId,
      planPeriod,
      txId: transaction.id,
    });

    return transaction;
  });
}
