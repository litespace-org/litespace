import {
  hashPassword,
  interviews,
  knex,
  lessons,
  messages,
  rooms,
  topics,
  users,
  ratings,
  tutors,
  availabilitySlots,
  contactRequests,
  sessionEvents,
  transactions,
  confirmationCodes,
  plans,
  subscriptions,
  invoices,
} from "@litespace/models";
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
} from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";
import { entries, first, range, sample } from "lodash";
import { Knex } from "knex";
import { Time } from "@litespace/utils/time";
export { faker } from "@faker-js/faker/locale/ar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { randomInt, randomUUID } from "crypto";
import { percentage, price } from "@litespace/utils";

dayjs.extend(utc);

export async function flush() {
  await knex.transaction(async (tx) => {
    await subscriptions.builder(tx).del();
    await transactions.builder(tx).del();
    await plans.builder(tx).del();
    await invoices.builder(tx).del();
    await sessionEvents.builder(tx).del();
    await topics.builder(tx).userTopics.del();
    await topics.builder(tx).topics.del();
    await messages.builder(tx).del();
    await rooms.builder(tx).members.del();
    await rooms.builder(tx).rooms.del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
    await interviews.builder(tx).del();
    await ratings.builder(tx).del();
    await confirmationCodes.builder(tx).del();
    await tutors.builder(tx).del();
    await availabilitySlots.builder(tx).del();
    await users.builder(tx).del();
    await contactRequests.builder(tx).del();
  });
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
  async slotId(id?: number, userId?: number): Promise<number> {
    if (!id) return await slot({ userId }).then((slot) => slot.id);
    return id;
  },
  async planId(id?: number): Promise<number> {
    if (!id) return await plan().then((plan) => plan.id);
    return id;
  },
  async txId(id?: number, userId?: number): Promise<number> {
    if (!id) return await transaction({ userId }).then((tx) => tx.id);
    return id;
  },
  role(role?: IUser.Role) {
    if (!role)
      return sample([
        IUser.Role.Student,
        IUser.Role.Tutor,
        IUser.Role.TutorManager,
        IUser.Role.SuperAdmin,
        IUser.Role.RegularAdmin,
        IUser.Role.Studio,
      ]);

    return role;
  },
  boolean(cond?: boolean) {
    if (cond === undefined) return sample([false, true]);
    return cond;
  },
  start(start?: string): string {
    if (!start) return faker.date.soon().toISOString();
    return start;
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
} as const;

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

export async function user(payload?: Partial<IUser.CreatePayload>) {
  return await users.create({
    email: payload?.email || faker.internet.email(),
    gender: payload?.gender || gender(),
    name: payload?.name || faker.internet.username(),
    password: hashPassword(payload?.password || "Password@8"),
    birthYear: payload?.birthYear || faker.number.int({ min: 2000, max: 2024 }),
    role: or.role(payload?.role),
    verifiedEmail: payload?.verifiedEmail || false,
  });
}

export async function slot(payload?: Partial<IAvailabilitySlot.CreatePayload>) {
  const start = dayjs.utc(payload?.start || faker.date.future());
  const end = payload?.end
    ? dayjs.utc(payload.end)
    : start.add(faker.number.int(8), "hours");

  const newSlots = await availabilitySlots.create([
    {
      userId: payload?.userId || 1,
      start: start.toISOString(),
      end: end.toISOString(),
    },
  ]);
  const res = first(newSlots);
  if (!res) throw Error("error: couldn't insert new slot.");
  return res;
}

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
      slot: await or.slotId(payload?.slot, tutor),
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

    return data;
  });
}

export async function interview(payload: Partial<IInterview.CreatePayload>) {
  return await interviews.create({
    interviewer: await or.tutorManagerId(payload.interviewer),
    interviewee: await or.tutorId(payload.interviewee),
    session: await or.sessionId("interview"),
    slot: await or.slotId(payload.slot, payload.interviewer),
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

async function tutor(
  userPayload?: Partial<IUser.CreatePayload>,
  tutorPayload?: Partial<ITutor.UpdatePayload>
) {
  const info = await user({ ...userPayload, role: IUser.Role.Tutor });
  const tutor = await tutors.create(info.id);
  await tutors.update(tutor.id, tutorPayload || {});
  return tutor;
}

async function onboardedTutor() {
  const newTutor = await tutor();

  await users.update(newTutor.id, {
    phone: "01012345678",
    image: "/image.jpg",
    verifiedEmail: true,
    verifiedPhone: true,
  });

  await tutors.update(newTutor.id, {
    about: faker.lorem.paragraphs(),
    bio: faker.person.bio(),
    activated: true,
    video: "/video.mp4",
    notice: 10,
  });

  return newTutor;
}

function student() {
  return user({ role: IUser.Role.Student });
}

async function tutorManager(
  userPayload?: Partial<IUser.CreatePayload>,
  tutorPayload?: Partial<ITutor.UpdatePayload>
) {
  const info = await user({ ...userPayload, role: IUser.Role.TutorManager });
  const tutor = await tutors.create(info.id);
  await tutors.update(tutor.id, tutorPayload || {});
  return tutor;
}

async function students(count: number) {
  return await Promise.all(range(0, count).map(() => student()));
}

async function makeTutors(count: number) {
  return await Promise.all(range(0, count).map(() => tutor()));
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
  const raterId: number =
    payload?.raterId ||
    (await user({ role: IUser.Role.Student }).then((user) => user.id));
  const rateeId: number =
    payload?.rateeId ||
    (await user({ role: IUser.Role.Tutor }).then((user) => user.id));

  return await ratings.create({
    rateeId,
    raterId,
    value: payload?.value || faker.number.int({ min: 0, max: 5 }),
    feedback: faker.lorem.words(20),
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
  return await knex.transaction(async (tx) => {
    const [firstUserId, secondUserId]: [number, number] = payload || [
      await tutor().then((user) => user.id),
      await student().then((user) => user.id),
    ];
    return await rooms.create([firstUserId, secondUserId], tx);
  });
}

async function makeMessage(
  _: Knex.Transaction,
  payload?: Partial<IMessage.CreatePayload>
) {
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
      interviewer: number;
      interviewees: number[];
      statuses: IInterview.Status[];
      levels: IInterview.Self["level"][];
    },
  ];
}) {
  for (const { interviewer, interviewees, statuses, levels } of payload.data) {
    for (const [key, interviewee] of entries(interviewees)) {
      const index = Number(key);
      const status = statuses[index];
      const level = levels[index];
      const interviewObj = await interview({
        interviewer,
        interviewee,
      });

      if (status)
        await interviews.update(interviewObj.ids.self, {
          status,
        });

      if (level)
        await interviews.update(interviewObj.ids.self, {
          level,
        });
    }
  }
}

async function transaction(
  payload?: Partial<ITransaction.CreatePayload>
): Promise<ITransaction.Self> {
  return await transactions.create({
    userId: await or.studentId(payload?.userId),
    amount: payload?.amount || randomInt(1000),
    paymentMethod: payload?.paymentMethod || ITransaction.PaymentMethod.Card,
    providerRefNum: payload?.providerRefNum || null,
    planId: await or.planId(payload?.planId),
    planPeriod: or.planPeriod(payload?.planPeriod),
  });
}

async function plan(
  payload?: Partial<IPlan.CreatePayload>
): Promise<IPlan.Self> {
  return await plans.create({
    weeklyMinutes: payload?.weeklyMinutes || randomInt(1000),
    baseMonthlyPrice: payload?.baseMonthlyPrice || randomPrice(),
    monthDiscount: payload?.monthDiscount || randomDiscount(),
    quarterDiscount: payload?.quarterDiscount || randomDiscount(),
    yearDiscount: payload?.yearDiscount || randomDiscount(),
    forInvitesOnly: or.boolean(payload?.forInvitesOnly),
    active: or.boolean(payload?.active),
  });
}

function randomPrice() {
  return price.scale(randomInt(5000));
}

function randomDiscount() {
  return percentage.scale(randomInt(100));
}

async function subscription(
  payload?: Partial<ISubscription.CreatePayload>
): Promise<ISubscription.Self> {
  const userId = await or.studentId(payload?.userId);
  return await subscriptions.create({
    userId,
    planId: await or.planId(payload?.planId),
    txId: await or.txId(payload?.txId, userId),
    period: or.planPeriod(payload?.period),
    weeklyMinutes: payload?.weeklyMinutes || sample([120, 150, 180]),
    start: payload?.start || faker.date.future().toISOString(),
    end: payload?.end || faker.date.future().toISOString(),
  });
}

export default {
  user,
  tutor,
  onboardedTutor,
  student,
  tutorManager,
  students,
  interview,
  lesson,
  flush,
  topic,
  slot,
  transaction,
  plan,
  subscription,
  room: makeRoom,
  message: makeMessage,
  make: {
    lessons: makeLessons,
    interviews: makeInterviews,
    tutors: makeTutors,
    rating: makeRating,
    ratings: makeRatings,
  },
};
