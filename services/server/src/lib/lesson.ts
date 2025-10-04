import { ILesson, ITransaction } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { DayLessonsMap } from "@/types/lesson";
import { sum } from "lodash";
import { knex, lessons, transactions, txLessonTemp } from "@litespace/models";
import { platformConfig } from "@/constants";
import { genSessionId } from "@litespace/utils";

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
