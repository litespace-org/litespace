import {
  hashPassword,
  interviews,
  knex,
  lessons,
  messages,
  rooms,
  sessionEvents,
  topics,
  users,
  students,
  ratings,
  tutors,
  availabilitySlots,
  contactRequests,
  invoices,
  reports,
  introVideos,
  demoSessions,
} from "@/index";
import {
  IInterview,
  ILesson,
  ITopic,
  IUser,
  IRating,
  IMessage,
  ISession,
  IAvailabilitySlot,
  ITutor,
  ITransaction,
  ISubscription,
  IPlan,
  IReport,
  IIntroVideo,
  IStudent,
} from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";
import { entries, first, range, sample } from "lodash";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/utils/time";
import { randomInt, randomUUID } from "crypto";
import { confirmationCodes } from "@/confirmationCodes";
import { transactions } from "@/transactions";
import { subscriptions } from "@/subscriptions";
import { plans } from "@/plans";
import { percentage, price } from "@litespace/utils";

export async function flush() {
  await knex.transaction(async (tx) => {
    await demoSessions.builder(tx).del();
    await reports.builder(tx).del();
    await subscriptions.builder(tx).del();
    await plans.builder(tx).del();
    await invoices.builder(tx).del();
    await sessionEvents.builder(tx).del();
    await topics.builder(tx).userTopics.del();
    await topics.builder(tx).topics.del();
    await messages.builder(tx).del();
    await rooms.builder(tx).members.del();
    await rooms.builder(tx).rooms.del();
    await interviews.builder(tx).del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
    await transactions.builder(tx).del();
    await interviews.builder(tx).del();
    await ratings.builder(tx).del();
    await introVideos.builder(tx).del();
    await tutors.builder(tx).del();
    await availabilitySlots.builder(tx).del();
    await confirmationCodes.builder(tx).del();
    await students.builder(tx).del();
    await users.builder(tx).del();
    await contactRequests.builder(tx).del();
  });
}

export function gender(): IUser.Gender {
  return sample([IUser.Gender.Male, IUser.Gender.Female])!;
}

export function duration(): number {
  return sample([15, 30])!;
}

export function time() {
  const times = range(0, 24).map((hour) =>
    [hour.toString().padStart(2, "0"), "00"].join(":")
  );
  return Time.from(sample(times)!).utc().format();
}

export async function user(
  payload: Omit<Partial<IUser.Self>, "password"> & {
    password?: string;
    withPassword?: boolean;
  }
) {
  return await users.create({
    email: payload.email || faker.internet.email(),
    gender: payload.gender || gender(),
    name: payload.name || faker.internet.username(),
    password: payload.withPassword
      ? hashPassword(payload.password || faker.internet.password())
      : undefined,
    birthYear: payload.birthYear || faker.number.int({ min: 2000, max: 2024 }),
    role: payload.role || IUser.Role.Tutor,
  });
}

export async function slot(payload?: Partial<IAvailabilitySlot.CreatePayload>) {
  const start = dayjs.utc(payload?.start || faker.date.future());
  const end = start.add(faker.number.int(8), "hours");

  const slots = await availabilitySlots.create([
    {
      userId: await or.tutorId(payload?.userId),
      start: start.toISOString(),
      end: end.toISOString(),
      purpose: payload?.purpose,
    },
  ]);
  const slot = first(slots);
  if (!slot) throw new Error("Slot not found; should never happen");
  return slot;
}

export async function report(payload?: Partial<IReport.CreateModelPayload>) {
  const report = await reports.create({
    userId: await or.studentId(payload?.userId),
    title: payload?.title || faker.lorem.words(5),
    description: payload?.description || faker.lorem.words(25),
    screenshot: payload?.screenshot,
    log: payload?.log,
  });
  if (!report) throw new Error("Slot not found; should never happen");
  return report;
}

const or = {
  async tutorId(id?: number): Promise<number> {
    if (!id) return await tutor().then((tutor) => tutor.id);
    return id;
  },
  async studentId(id?: number): Promise<number> {
    if (!id) return await student().then((student) => student.id);
    return id;
  },
  async tutorManagerId(id?: number): Promise<number> {
    if (!id)
      return await tutorManager().then((tutorManager) => tutorManager.id);
    return id;
  },
  async sessionId(type: ISession.Type): Promise<ISession.Id> {
    return `${type}:${randomUUID()}`;
  },
  async roomId(roomId?: number): Promise<number> {
    if (!roomId) return await makeRoom();
    return roomId;
  },
  async slotId(id?: number): Promise<number> {
    if (!id) return await slot().then((slot) => slot.id);
    return id;
  },
  async planId(id?: number): Promise<number> {
    if (!id) return await plan().then((plan) => plan.id);
    return id;
  },
  planPeriod(period?: IPlan.Period) {
    if (!period)
      return sample([
        IPlan.Period.Month,
        IPlan.Period.Quarter,
        IPlan.Period.Year,
      ]);
    return period;
  },
  boolean(cond?: boolean) {
    if (cond === undefined) return sample([false, true]);
    return cond;
  },
  start(start?: string): string {
    if (!start) return faker.date.soon().toISOString();
    return start;
  },
} as const;

type LessonReturn = {
  lesson: ILesson.Self;
  members: ILesson.Member[];
};

export async function lesson(
  payload?: Partial<ILesson.CreatePayload> & {
    timing?: "future" | "past";
    canceled?: boolean;
  }
): Promise<LessonReturn> {
  return await knex.transaction(async (tx: Knex.Transaction) => {
    const tutor = await or.tutorId(payload?.tutor);
    const student = await or.studentId(payload?.student);
    const data = await lessons.create({
      session: await or.sessionId("lesson"),
      start:
        payload?.timing === "future"
          ? faker.date.future().toISOString()
          : payload?.timing === "past"
            ? faker.date.past().toISOString()
            : payload?.start || faker.date.soon().toISOString(),
      duration: payload?.duration || sample([15, 30]),
      price: payload?.price || faker.number.int(500),
      slot: await or.slotId(payload?.slot),
      student,
      tutor,
      tx,
    });

    if (payload?.canceled)
      await lessons.cancel({
        canceledBy: tutor,
        ids: [data.lesson.id],
        tx,
      });
    const lesson = await lessons.findById(data.lesson.id);
    return { lesson: lesson || data.lesson, members: data.members };
  });
}

export async function interview(
  payload: Partial<IInterview.CreateModelPayload>
) {
  return await interviews.create({
    interviewerId: await or.tutorManagerId(payload.interviewerId),
    intervieweeId: await or.tutorId(payload.intervieweeId),
    session: await or.sessionId("interview"),
    slot: await or.slotId(payload.slot),
    start: or.start(payload.start),
  });
}

export async function topic(payload?: Partial<ITopic.CreatePayload>) {
  return await topics.create({
    name: {
      ar: payload?.name?.ar || faker.animal.bear(),
      en: payload?.name?.en || faker.animal.bird(),
    },
  });
}

/**
 * behaves as studentUser
 */
async function student(
  studentPayload?: Partial<IStudent.CreateModelPayload>,
  userPayload?: Partial<IUser.CreatePayload>
): Promise<IUser.Self> {
  const info = await user({ ...userPayload, role: IUser.Role.Student });
  await students.create({
    userId: info.id,
    ...studentPayload,
  });
  return info;
}

async function nativeStudent(
  studentPayload?: Partial<IStudent.CreateModelPayload>,
  userPayload?: Partial<IUser.CreatePayload>
): Promise<IStudent.Self> {
  const info = await user({ ...userPayload, role: IUser.Role.Student });
  return await students.create({
    userId: info.id,
    ...studentPayload,
  });
}

async function tutor(
  tutorPayload?: Partial<ITutor.UpdatePayload>,
  userPayload?: Partial<IUser.UpdateModelPayload>,
  withPassword?: boolean
) {
  const info = await user({ role: IUser.Role.Tutor, withPassword });
  const tutor = await tutors.create(info.id);
  await tutors.update(tutor.id, tutorPayload || {});
  await users.update(tutor.id, userPayload || {});
  const data = await tutors.findById(tutor.id);
  if (!data) throw new Error("tutor not found");
  return data;
}

async function tutorManager(
  tutorPayload?: Partial<ITutor.UpdatePayload>,
  userPayload?: Partial<IUser.UpdateModelPayload>
) {
  const info = await user({ role: IUser.Role.TutorManager });
  const tutor = await tutors.create(info.id);
  await tutors.update(tutor.id, tutorPayload || {});
  await users.update(tutor.id, userPayload || {});
  const data = await tutors.findById(tutor.id);
  if (!data) throw new Error("tutor not found");
  return data;
}

async function makeTutors(count: number) {
  return await Promise.all(range(0, count).map(() => tutor()));
}

async function makeStudents(count: number) {
  return await Promise.all(range(0, count).map(() => student()));
}

export type MakeLessonsReturn = Array<{
  future: LessonReturn[];
  past: LessonReturn[];
  canceled: {
    future: LessonReturn[];
    past: LessonReturn[];
  };
  uncanceled: {
    future: LessonReturn[];
    past: LessonReturn[];
  };
}>;

async function makeLessons({
  tutor,
  students,
  future,
  past,
  canceled,
  duration,
  price,
  slot,
}: {
  tutor: number;
  students: number[];
  future: number[];
  past: number[];
  duration?: ILesson.Duration;
  price?: number;
  canceled: {
    future: number[];
    past: number[];
  };
  slot: number;
}): Promise<MakeLessonsReturn> {
  const result: MakeLessonsReturn = [];

  for (const [key, student] of entries(students)) {
    const index = Number(key);
    const futureLessonCount = future[index];
    const pastLessonCount = past[index];
    const canceledFutureLessonCount = canceled.future[index];
    const canceledPastLessonCount = canceled.past[index];

    const create = async (start: string) => {
      return await lesson({
        slot,
        tutor,
        student,
        start,
        duration,
        price,
      });
    };

    const futureLessons = await Promise.all(
      range(0, futureLessonCount).map((i) =>
        create(
          dayjs
            .utc()
            .add(i + 1, "days")
            .toISOString()
        )
      )
    );

    const pastLessons = await Promise.all(
      range(0, pastLessonCount).map((i) =>
        create(
          dayjs
            .utc()
            .subtract(i + 1, "days")
            .toISOString()
        )
      )
    );

    // cancel future lessons
    const canceledFutureLessons = await Promise.all(
      range(0, canceledFutureLessonCount).map(async (i) => {
        const info = futureLessons[i];
        if (!lesson) throw new Error("invalid future lesson index");
        await lessons.cancel({
          canceledBy: tutor,
          ids: [info.lesson.id],
        });
        return info;
      })
    );

    // cancel past lessons
    const canceledPastLessons = await Promise.all(
      range(0, canceledPastLessonCount).map(async (i) => {
        const info = pastLessons[i];
        if (!info) throw new Error("invalid past lesson index");
        await lessons.cancel({
          canceledBy: tutor,
          ids: [info.lesson.id],
        });
        return info;
      })
    );

    const canceledFutureLessonIds = canceledFutureLessons.map(
      (future) => future.lesson.id
    );
    const canceledPastLessonIds = canceledPastLessons.map(
      (past) => past.lesson.id
    );
    // filter out canceled future lessons
    const uncanceledFutureLessons = futureLessons.filter(
      (future) => !canceledFutureLessonIds.includes(future.lesson.id)
    );
    // filter out canceled past lessons
    const uncanceledPastLessons = pastLessons.filter(
      (past) => !canceledPastLessonIds.includes(past.lesson.id)
    );
    result.push({
      future: futureLessons,
      past: pastLessons,
      canceled: {
        future: canceledFutureLessons,
        past: canceledPastLessons,
      },
      uncanceled: {
        future: uncanceledFutureLessons,
        past: uncanceledPastLessons,
      },
    });
  }

  return result;
}

export async function makeRating(payload?: Partial<IRating.CreatePayload>) {
  return await ratings.create({
    raterId: await or.studentId(payload?.raterId),
    rateeId: await or.tutorId(payload?.rateeId),
    value: payload?.value || faker.number.int({ min: 0, max: 5 }),
    feedback: payload?.feedback || faker.lorem.words(20),
  });
}

export async function makeRatings({
  values,
  ratee,
}: {
  values: number[];
  ratee?: number;
}) {
  const rateeId: number =
    ratee || (await user({ role: IUser.Role.Tutor }).then((user) => user.id));

  return Promise.all(
    values.map(async (value) => {
      const student = await user({ role: IUser.Role.Student });
      return await ratings.create({
        rateeId: rateeId,
        raterId: student.id,
        value: value,
        feedback: "Great Teacher",
      });
    })
  );
}

async function makeRoom(payload?: [number, number]) {
  const [firstUserId, secondUserId]: [number, number] = payload || [
    await tutor().then((user) => user.id),
    await student().then((user) => user.id),
  ];
  return await knex.transaction(async (tx) => {
    return await rooms.create([firstUserId, secondUserId], tx);
  });
}

async function makeMessage(payload?: Partial<IMessage.CreatePayload>) {
  const roomId: number = await or.roomId(payload?.roomId);
  const userId: number =
    payload?.userId ||
    (await rooms
      .findRoomMembers({ roomIds: [roomId] })
      .then((members) => members[0].id));

  const text = payload?.text || faker.lorem.words(10);

  return await messages.create({
    userId,
    roomId,
    text,
  });
}

async function makeInterviews(payload: {
  data: [
    {
      interviewerId: number;
      interviewees: number[];
      statuses: IInterview.Status[];
    },
  ];
}) {
  for (const { interviewerId, interviewees, statuses } of payload.data) {
    for (const [key, intervieweeId] of entries(interviewees)) {
      const index = Number(key);
      const status = statuses[index];
      const interviewData = await interview({
        interviewerId,
        intervieweeId,
      });

      if (status) await interviews.update({ id: interviewData.id, status });
    }
  }
}

async function transaction(
  payload?: Partial<ITransaction.CreatePayload>
): Promise<ITransaction.Self> {
  return await transactions.create({
    userId: payload?.userId || (await user({})).id,
    amount: payload?.amount || randomInt(100, 1000),
    paymentMethod: payload?.paymentMethod || ITransaction.PaymentMethod.Card,
    providerRefNum: payload?.providerRefNum || null,
    type: payload?.type || ITransaction.Type.PaidPlan,
  });
}

async function plan(
  payload?: Partial<IPlan.CreatePayload>
): Promise<IPlan.Self> {
  return await plans.create({
    weeklyMinutes: payload?.weeklyMinutes || randomInt(100, 1000),
    baseMonthlyPrice: payload?.baseMonthlyPrice || randomPrice(),
    monthDiscount: payload?.monthDiscount || randomDiscount(),
    quarterDiscount: payload?.quarterDiscount || randomDiscount(),
    yearDiscount: payload?.yearDiscount || randomDiscount(),
    forInvitesOnly: or.boolean(payload?.forInvitesOnly),
    active: or.boolean(payload?.active),
  });
}

async function introVideo(
  payload?: Partial<IIntroVideo.CreateModelPayload>
): Promise<IIntroVideo.Self> {
  return await introVideos.create({
    src: payload?.src || randomVideo(),
    tutorId: await or.tutorId(payload?.tutorId),
    reviewerId: await or.tutorManagerId(payload?.reviewerId),
  });
}

function randomVideo() {
  return sample([
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ]);
}

function randomPrice() {
  return price.scale(randomInt(1, 5000));
}

function randomDiscount() {
  return percentage.scale(randomInt(10, 100));
}

async function subscription(
  payload?: Partial<ISubscription.CreatePayload>
): Promise<ISubscription.Self> {
  const userId = await or.studentId(payload?.userId);
  return await subscriptions.create({
    userId,
    planId: await or.planId(payload?.planId),
    txId: payload?.txId || (await transaction({ userId })).id,
    period: or.planPeriod(payload?.period),
    weeklyMinutes: payload?.weeklyMinutes || randomInt(1, 1000),
    start: payload?.start || faker.date.future().toISOString(),
    end: payload?.end || faker.date.future().toISOString(),
  });
}

export default {
  user,
  tutor,
  student,
  nativeStudent,
  tutorManager,
  interview,
  lesson,
  flush,
  introVideo,
  topic,
  slot,
  plan,
  transaction,
  subscription,
  report,
  room: makeRoom,
  rating: makeRating,
  message: makeMessage,
  make: {
    students: makeStudents,
    lessons: makeLessons,
    interviews: makeInterviews,
    tutors: makeTutors,
    ratings: makeRatings,
    room: makeRoom,
  },
};
