import {
  knex,
  transactions,
  txLessonTemps,
  txPlanTemps,
} from "@litespace/models";
import { ILesson, IPlan, ITransaction } from "@litespace/types";

export async function createPaidLessonTx({
  userId,
  phone,
  amount,
  tutorId,
  slotId,
  start,
  duration,
  paymentMethod,
}: {
  userId: number;
  phone: string;
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
      userId,
      phone,
      providerRefNum: null,
      amount,
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
  phone,
  amount,
  paymentMethod,
  planId,
  planPeriod,
}: {
  userId: number;
  phone: string;
  amount: number;
  paymentMethod: ITransaction.PaymentMethod;
  planId: number;
  planPeriod: IPlan.Period;
}) {
  return await knex.transaction(async (tx) => {
    const transaction = await transactions.create({
      tx,
      userId,
      phone,
      providerRefNum: null,
      amount,
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

export function newTxStatus(
  curStatus: ITransaction.Status,
  newStatus: ITransaction.Status
): ITransaction.Status {
  if (newStatus === ITransaction.Status.New)
    return ITransaction.Status.Processed;

  if (
    newStatus === ITransaction.Status.Paid &&
    curStatus === ITransaction.Status.Refunding
  )
    return ITransaction.Status.Refunding;

  return newStatus;
}
