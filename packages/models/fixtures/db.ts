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
  ratings,
  tutors,
  availabilitySlots,
  contactRequests,
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
} from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";
import { entries, first, range, sample } from "lodash";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/utils/time";
import { randomUUID } from "crypto";

export async function flush() {
  await knex.transaction(async (tx) => {
    await sessionEvents.builder(tx).del();
    await topics.builder(tx).userTopics.del();
    await topics.builder(tx).topics.del();
    await messages.builder(tx).del();
    await rooms.builder(tx).members.del();
    await rooms.builder(tx).rooms.del();
    await interviews.builder(tx).del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
    await interviews.builder(tx).del();
    await ratings.builder(tx).del();
    await tutors.builder(tx).del();
    await availabilitySlots.builder(tx).del();
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
  }
) {
  return await users.create({
    email: payload.email || faker.internet.email(),
    gender: payload.gender || gender(),
    name: payload.name || faker.internet.username(),
    password: hashPassword(payload.password || faker.internet.password()),
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
    },
  ]);
  const slot = first(slots);
  if (!slot) throw new Error("Slot not found; should never happen");
  return slot;
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

export async function interview(payload: Partial<IInterview.CreatePayload>) {
  return await interviews.create({
    interviewer: await or.tutorManagerId(payload.interviewer),
    interviewee: await or.tutorId(payload.interviewee),
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

async function tutor(
  tutorPayload?: Partial<ITutor.UpdatePayload>,
  userPayload?: Partial<IUser.UpdatePayload>
) {
  const info = await user({ role: IUser.Role.Tutor });
  const tutor = await tutors.create(info.id);
  await tutors.update(tutor.id, tutorPayload || {});
  await users.update(tutor.id, userPayload || {});
  return (await tutors.findById(tutor.id))!;
}

function student() {
  return user({ role: IUser.Role.Student });
}

async function tutorManager(
  tutorPayload?: Partial<ITutor.UpdatePayload>,
  userPayload?: Partial<IUser.UpdatePayload>
) {
  const info = await user({ role: IUser.Role.TutorManager });
  const tutor = await tutors.create(info.id);
  await tutors.update(tutor.id, tutorPayload || {});
  await users.update(tutor.id, userPayload || {});
  return (await tutors.findById(tutor.id))!;
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

export default {
  user,
  tutor,
  student,
  tutorManager,
  students,
  interview,
  lesson,
  flush,
  topic,
  slot,
  room: makeRoom,
  rating: makeRating,
  message: makeMessage,
  make: {
    lessons: makeLessons,
    interviews: makeInterviews,
    tutors: makeTutors,
    ratings: makeRatings,
    room: makeRoom,
  },
};
