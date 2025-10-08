import { ILesson, ITransaction, IUser, Wss } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { DayLessonsMap } from "@/types/lesson";
import { first, isEmpty, sum } from "lodash";
import {
  availabilitySlots,
  knex,
  lessons,
  rooms,
  subscriptions,
  transactions,
  tutors,
  txLessonTemps,
} from "@litespace/models";
import {
  AFRICA_CAIRO_TIMEZONE,
  MAX_PAID_LESSON_COUNT,
  calculateLessonPrice,
  count,
  genSessionId,
  isTutorManager,
  nameof,
} from "@litespace/utils";
import {
  BusyTutor,
  InvalidLessonStart,
  SlotNotFound,
  TutorNotFound,
  Unexpected,
} from "@/lib/error/local";
import { calcRemainingWeeklyMinutesBySubscription } from "@/lib/subscription";
import { getCurrentWeekBoundaries } from "@litespace/utils/subscription";
import { isBookable } from "@/lib/session";
import { Knex } from "knex";
import { sendMsg } from "@/lib/messenger";
import { ApiContext } from "@/types/api";
import { withDevLog } from "@/lib/utils";

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
  io,
  txId,
  userId,
  status,
  fawryRefNumber,
}: {
  txId: number;
  userId: number;
  status: ITransaction.Status;
  fawryRefNumber: string;
  io: ApiContext["io"];
}) {
  const lesson = await lessons.findOne({ txs: [txId] });
  const txLesson = await txLessonTemps.findByTxId({ txId });

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

    const terminated =
      status === ITransaction.Status.Canceled ||
      status === ITransaction.Status.Refunded ||
      status === ITransaction.Status.PartialRefunded ||
      status === ITransaction.Status.Failed;

    const paid = status === ITransaction.Status.Paid;

    // Cancel lesson in case the tx was canceled, refunded, or failed.
    if (terminated)
      return await knex.transaction(async (tx) => {
        if (txLesson) await txLessonTemps.delete({ tx, txId });
        if (lesson)
          await lessons.cancel({ ids: [lesson.id], canceledBy: userId, tx });
      });

    if (!lesson && paid) {
      await knex.transaction(async (tx) => {
        if (!txLesson) throw new Error("Temporary lesson data not found.");

        const lesson = await createLesson({
          userId,
          duration: txLesson.duration,
          start: txLesson.start,
          tutorId: txLesson.tutorId,
          slotId: txLesson.slotId,
          txId,
          io,
          tx,
        });
        // Don't delete the temp lesson data incase we failed to create the lesson.
        if (lesson instanceof Error) return;
        await txLessonTemps.delete({ tx, txId });
      });
    }
  });
}

export type CheckStudentPaidLessonStateReturn =
  | {
      status:
        | ILesson.PaidLessonStatus.EligibleWithPayment
        | ILesson.PaidLessonStatus.NotEligible;
      hasPendingPaidLesson: boolean;
    }
  | {
      status: ILesson.PaidLessonStatus.EligitbleWithoutPayment;
      txId: number;
      duration: ILesson.Duration;
      hasPendingPaidLesson: boolean;
    }
  | Unexpected;

/**
 * @note we assume that all lessons are 30mins.
 */
export async function checkStudentPaidLessonState(
  userId: number
): Promise<CheckStudentPaidLessonStateReturn> {
  const { list: txs } = await transactions.find({
    types: [ITransaction.Type.PaidLesson],
    statuses: [ITransaction.Status.Paid],
    users: [userId],
    full: true,
  });

  withDevLog({
    src: nameof(checkStudentPaidLessonState),
    txs,
  });

  if (isEmpty(txs))
    return {
      status: ILesson.PaidLessonStatus.EligibleWithPayment,
      hasPendingPaidLesson: false,
    };

  const { list: paidLessons } = await lessons.find({
    txs: txs.map((tx) => tx.id),
    users: [userId],
    full: true,
  });

  const hasPendingPaidLesson = !!paidLessons.find(
    (lesson) =>
      dayjs(lesson.start).add(lesson.duration, "minutes").isAfter(dayjs()) &&
      !lesson.canceledBy &&
      !lesson.canceledAt
  );

  withDevLog({
    src: nameof(checkStudentPaidLessonState),
    paidLessons,
  });

  const fulfilledPaidLessonCount = count(
    paidLessons,
    (lesson) => !lesson.canceledAt && !lesson.canceledBy
  );
  if (fulfilledPaidLessonCount >= MAX_PAID_LESSON_COUNT)
    return {
      status: ILesson.PaidLessonStatus.NotEligible,
      hasPendingPaidLesson,
    };

  for (const tx of txs) {
    const txLessons = paidLessons.filter((lesson) => lesson.txId === tx.id);
    const duration = await getPaidLessonDuration(tx.id, txLessons);

    if (!duration)
      return new Unexpected("Unable to determine the lesson duration");

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
        status: ILesson.PaidLessonStatus.EligitbleWithoutPayment,
        hasPendingPaidLesson,
        txId: tx.id,
        duration,
      };
  }

  if (txs.length < MAX_PAID_LESSON_COUNT)
    return {
      status: ILesson.PaidLessonStatus.EligibleWithPayment,
      hasPendingPaidLesson,
    };

  return { status: ILesson.PaidLessonStatus.NotEligible, hasPendingPaidLesson };
}

export async function getPaidLessonDuration(
  txId: number,
  lessons: ILesson.Self[]
): Promise<ILesson.Duration | null> {
  const lesson = first(lessons);
  if (lesson) return lesson.duration;
  const txLesson = await txLessonTemps.findByTxId({ txId });
  return txLesson?.duration || null;
}

export async function checkBookingLessonEligibilityState({
  userId,
  duration,
  start,
}: {
  userId: number;
  duration: ILesson.Duration;
  start: string;
}): Promise<{ eligible: boolean; txId?: number } | Unexpected> {
  const subscription = await subscriptions
    .find({
      users: [userId],
      terminated: false,
      end: { after: dayjs.utc().toISOString() },
    })
    .then(({ list }) => first(list));

  const state: CheckStudentPaidLessonStateReturn = !subscription
    ? await checkStudentPaidLessonState(userId)
    : {
        status: ILesson.PaidLessonStatus.NotEligible,
        hasPendingPaidLesson: false,
      };

  withDevLog({
    src: nameof(checkBookingLessonEligibilityState),
    state,
    subscription,
  });

  if (state instanceof Unexpected) return state;
  if (state.status === ILesson.PaidLessonStatus.EligitbleWithoutPayment)
    return { eligible: true, txId: state.txId };
  if (!subscription) return { eligible: false };

  const remainingMinutes =
    await calcRemainingWeeklyMinutesBySubscription(subscription);

  // subscribed users should not be able to book lessons not within the
  // current week
  const weekBoundaries = getCurrentWeekBoundaries(subscription.start);
  const within = dayjs
    .utc(start)
    .add(duration, "minutes")
    .isBetween(weekBoundaries.start, weekBoundaries.end, "minutes", "[]");

  console.log({ within, remainingMinutes });

  return { eligible: within && remainingMinutes >= duration };
}

/**
 * @description validates the create lesson payload and returns the tutor data.
 */
export async function validateCreateLessonPayload({
  duration,
  tutorId,
  slotId,
  start,
}: {
  tutorId: number;
  slotId: number;
  start: string;
  duration: ILesson.Duration;
}): Promise<
  TutorNotFound | SlotNotFound | InvalidLessonStart | BusyTutor | IUser.Self
> {
  const tutor = await tutors.findById(tutorId);
  if (!tutor) return new TutorNotFound();

  const slot = await availabilitySlots.findById(slotId);
  if (!slot) return new SlotNotFound();

  // lesson should be in the future
  if (dayjs.utc(start).isBefore(dayjs.utc().subtract(tutor.notice, "minute")))
    return new InvalidLessonStart();

  // Check if the new lessons intercepts any of current subslots
  const bookable = await isBookable({
    slot,
    bookInfo: { start, duration },
  });
  if (!bookable) return new BusyTutor();
  return tutor;
}

export async function createLesson({
  userId,
  tutorId,
  slotId,
  start,
  duration,
  txId,
  io,
  tx,
}: {
  userId: number;
  tutorId: number;
  slotId: number;
  start: string;
  duration: ILesson.Duration;
  txId?: number;
  io: ApiContext["io"];
  tx: Knex.Transaction;
}): Promise<
  ILesson.Self | TutorNotFound | SlotNotFound | InvalidLessonStart | BusyTutor
> {
  const tutor = await validateCreateLessonPayload({
    tutorId,
    slotId,
    start,
    duration,
  });
  if (tutor instanceof Error) return tutor;

  const price = isTutorManager(tutor) ? 0 : calculateLessonPrice(duration);

  // Create the lesson with its associated room if it doesn't exist
  const roomMembers = [userId, tutorId];
  const room = await rooms.findRoomByMembers(roomMembers);
  if (!room) await rooms.create(roomMembers, tx);

  const { lesson } = await lessons.create({
    tutor: tutorId,
    student: userId,
    start,
    duration,
    slot: slotId,
    session: genSessionId("lesson"),
    price,
    txId,
    tx,
  });

  if (tutor.phone && tutor.notificationMethod)
    sendMsg({
      to: tutor.phone,
      template: {
        name: "new_lesson_booked",
        parameters: {
          duration: lesson.duration,
          date: dayjs(lesson.start)
            .tz(AFRICA_CAIRO_TIMEZONE)
            .format("ddd D MMM hh:mm A"),
        },
      },
      method: tutor.notificationMethod,
    });

  io.sockets.in(Wss.Room.TutorsCache).emit(Wss.ServerEvent.LessonBooked, {
    tutor: tutor.id,
    lesson: lesson.id,
  });

  return lesson;
}
