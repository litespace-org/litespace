import { ILesson, ITransaction } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { DayLessonsMap } from "@/types/lesson";
import { first, isEmpty, sum } from "lodash";
import { knex, lessons, transactions, txLessonTemp } from "@litespace/models";
import { platformConfig } from "@/constants";
import { MAX_PAID_LESSON_COUNT, count, genSessionId } from "@litespace/utils";
import { Unexpected } from "@/lib/error/local";

export function getDayLessonsMap(lessons: Array<ILesson.Self>): DayLessonsMap {
  const dayLessonsMap: DayLessonsMap = {};

  for (const lesson of lessons) {
    const day = dayjs(lesson.start).format("YYYY-MM-DD");
    if (!dayLessonsMap[day]) {
      dayLessonsMap[day] = { paid: [], free: [] };
    }
    if (lesson.price > 0) dayLessonsMap[day].paid.push(lesson);
    else dayLessonsMap[day].free.push(lesson);
  }

  return dayLessonsMap;
}

export function inflateDayLessonsMap(map: DayLessonsMap) {
  const inflatted = [];

  for (const day in map) {
    const paidLessons = map[day].paid;
    const freeLessons = map[day].free;
    inflatted.push({
      date: day,
      paidLessonCount: paidLessons.length,
      paidTutoringMinutes: sum(paidLessons.map((l) => l.duration)) || 0,
      freeLessonCount: freeLessons.length,
      freeTutoringMinutes: sum(freeLessons.map((l) => l.duration)) || 0,
    });
  }

  return inflatted;
}

export async function upsertLessonByTxStatus({
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
  const lesson = await lessons.findOne({ txs: [txId] });
  const newTxStatus =
    status === ITransaction.Status.New ? ITransaction.Status.Processed : status;

  await knex.transaction(async (tx) => {
    // Update the transaction with the latest status.
    await transactions.update({
      tx,
      id: txId,
      status: newTxStatus,
      providerRefNum: fawryRefNumber,
    });

    // Terminate subscription in case the tx was canceled, refunded, or failed.
    if (
      lesson &&
      (status === ITransaction.Status.Canceled ||
        status === ITransaction.Status.Refunded ||
        status === ITransaction.Status.Failed)
    )
      return await lessons.cancel({ ids: [lesson.id], canceledBy: userId });

    if (!lesson && status === ITransaction.Status.Paid) {
      await knex.transaction(async (tx) => {
        const txLesson = await txLessonTemp.findByTxId({ tx, txId });
        if (!txLesson) throw new Error("Temporary lesson data not found.");

        await lessons.create({
          tx,
          txId,
          duration: txLesson.duration,
          start: txLesson.start,
          tutor: txLesson.tutorId,
          slot: txLesson.slotId,
          student: userId,
          price: platformConfig.tutorHourlyRate,
          session: genSessionId("lesson"),
        });

        await txLessonTemp.delete({ tx, txId });
      });
    }
  });
}

/**
 * This function is designed to answer these question regarding the user:
 * 1. Is the user elegible for buying paid lessons? This is answered via the flag `isEligibleForPaidLessons`.
 *    - if `true`, the user can buy more paid lesson.
 *    - if `false`, the user is not elegible to do so and we should ask him to subscribe.
 * 2. Should the user pay for a paid lesson or not?
 *    - if `isPaidLessonAvailble` and `paymentNeeded` are true, the user should pay.
 *    - if `isPaidLessonAvailble` is `flase` and `paymentNeeded` are true, the user should pay.
 *    - if `isPaidLessonAvailble` is `true` and `paymentNeeded` is `false`, the user should book the lesson without paying.
 * @note we assume that all lessons are 30mins.
 */
export async function checkStudentPaidLessonStatus(userId: number): Promise<
  | {
      isEligibleForPaidLessons: boolean;
      isPaidLessonAvailble: boolean;
      paymentNeeded: boolean;
    }
  | Unexpected
> {
  const { list: txs } = await transactions.find({
    types: [ITransaction.Type.PaidLesson],
    statuses: [ITransaction.Status.Paid],
    users: [userId],
  });

  if (isEmpty(txs))
    return {
      isEligibleForPaidLessons: true,
      isPaidLessonAvailble: false,
      paymentNeeded: true,
    };

  const { list: paidLessons } = await lessons.find({
    txs: txs.map((tx) => tx.id),
    users: [userId],
  });

  const fulfilledPaidLessonCount = count(
    paidLessons,
    (lesson) => !lesson.canceledAt && !lesson.canceledBy
  );
  if (fulfilledPaidLessonCount >= MAX_PAID_LESSON_COUNT)
    return {
      isEligibleForPaidLessons: false,
      isPaidLessonAvailble: false,
      paymentNeeded: false,
    };

  for (const tx of txs) {
    const txLessons = paidLessons.filter((lesson) => lesson.txId === tx.id);
    const sampleLesson = first(txLessons);
    if (!sampleLesson)
      return new Unexpected(
        "Found a transaction without any associated lessons. It should never happen."
      );

    const pending = txLessons.filter(
      (lesson) => !lesson.canceledAt || !lesson.canceledBy
    );
    if (pending.length > 1)
      return new Unexpected(
        "Found a transaction with more than one pending lesson. It should never happen."
      );

    const lesson = first(pending);
    if (!lesson)
      return {
        isEligibleForPaidLessons: true,
        isPaidLessonAvailble: true,
        paymentNeeded: false,
      };
  }

  return {
    isEligibleForPaidLessons: false,
    isPaidLessonAvailble: false,
    paymentNeeded: false,
  };
}
