import {
  calls,
  hashPassword,
  interviews,
  knex,
  lessons,
  messages,
  rooms,
  rules,
  topics,
  users,
  ratings,
} from "@litespace/models";
import {
  ICall,
  IInterview,
  ILesson,
  IRule,
  ITopic,
  IUser,
  IRating,
  IMessage,
} from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";
import { entries, range, sample } from "lodash";
import { Knex } from "knex";
import { Time } from "@litespace/sol/time";
export { faker } from "@faker-js/faker/locale/ar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function flush() {
  await knex.transaction(async (tx) => {
    await topics.builder(tx).userTopics.del();
    await topics.builder(tx).topics.del();
    await messages.builder(tx).del();
    await rooms.builder(tx).members.del();
    await rooms.builder(tx).rooms.del();
    await interviews.builder(tx).del();
    await calls.builder(tx).members.del();
    await calls.builder(tx).calls.del();
    await rules.builder(tx).del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
    await ratings.builder(tx).del();
    await users.builder(tx).del();
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

export async function user(payload?: Partial<IUser.CreatePayload>) {
  return await users.create({
    email: payload?.email || faker.internet.email(),
    gender: payload?.gender || gender(),
    name: payload?.name || faker.internet.username(),
    password: hashPassword(payload?.password || faker.internet.password()),
    birthYear: payload?.birthYear || faker.number.int({ min: 2000, max: 2024 }),
    role: payload?.role || sample(Object.values(IUser.Role))!,
  });
}

export async function rule(payload?: Partial<IRule.CreatePayload>) {
  const start = dayjs.utc(payload?.start || faker.date.future());
  const end = start.add(faker.number.int(8), "hours");
  const frequency =
    payload?.frequency ||
    sample([
      IRule.Frequency.Daily,
      IRule.Frequency.Weekly,
      IRule.Frequency.Monthly,
    ]);

  return await rules.create({
    duration: payload?.duration || duration(),
    start: start.toISOString(),
    end: end.toISOString(),
    frequency,
    time: payload?.time || time(),
    title: faker.word.adjective(),
    userId: payload?.userId || 1,
    monthday: payload?.monthday,
    weekdays: payload?.weekdays,
  });
}

type LessonReturn = {
  lesson: { self: ILesson.Self; members: ILesson.Member[] };
  call: { self: ICall.Self; members: ICall.Member[] };
};

export async function lesson(payload?: {
  call?: Partial<ICall.CreatePayload>;
  lesson?: Partial<ILesson.CreatePayload>;
}): Promise<LessonReturn> {
  return await knex.transaction(async (tx: Knex.Transaction) => {
    const { call, members: callMembers } = await calls.create(
      {
        start: payload?.call?.start || faker.date.soon().toISOString(),
        duration: payload?.call?.duration || duration(),
        host: payload?.call?.host || 1,
        members: payload?.call?.members || [],
        rule: payload?.call?.rule || 1,
      },
      tx
    );

    const { lesson, members: lessonMembers } = await lessons.create(
      {
        call: call.id,
        host: payload?.lesson?.host || 1,
        members: payload?.lesson?.members || [],
        price: payload?.lesson?.price || faker.number.int(500),
      },
      tx
    );

    return {
      lesson: { self: lesson, members: lessonMembers },
      call: { self: call, members: callMembers },
    };
  });
}

export async function interview(payload: Partial<IInterview.CreatePayload>) {
  return await knex.transaction(async (tx: Knex.Transaction) => {
    const interviewerId: number =
      payload.interviewer || (await interviewer().then((user) => user.id));

    const intervieweeId: number =
      payload.interviewee || (await tutor().then((user) => user.id));

    const callId: number =
      payload.call ||
      (await call(
        {
          host: interviewerId,
          members: [intervieweeId],
        },
        tx
      ).then(({ call }) => call.id));

    return await interviews.create(
      {
        interviewer: interviewerId,
        interviewee: intervieweeId,
        call: callId,
      },
      tx
    );
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

export async function cancelLesson({
  lesson,
  call,
  user,
}: {
  lesson: number;
  call: number;
  user: number;
}) {
  await knex.transaction(async (tx: Knex.Transaction) => {
    await calls.cancel(call, user, tx);
    await lessons.cancel(lesson, user, tx);
  });
}

function tutor() {
  return user({ role: IUser.Role.Tutor });
}

function student() {
  return user({ role: IUser.Role.Student });
}

function interviewer() {
  return user({ role: IUser.Role.Interviewer });
}

async function students(count: number) {
  return await Promise.all(range(0, count).map(() => student()));
}

async function makeTutors(count: number) {
  return await Promise.all(range(0, count).map(() => tutor()));
}

async function call(
  payload: Partial<ICall.CreatePayload>,
  tx: Knex.Transaction
) {
  const host: number =
    payload.host || (await tutor().then((tutor) => tutor.id));
  const members: number[] = payload.members || [
    await student().then((student) => student.id),
  ];
  const callRule: number =
    payload.rule ||
    (await rule({
      userId: host,
    }).then((rule) => rule.id));

  return await calls.create(
    {
      host,
      members,
      duration: payload.duration || duration(),
      rule: callRule,
      start: payload.start || faker.date.anytime().toISOString(),
    },
    tx
  );
}

async function makeLesson({
  future,
  canceled,
}: {
  future?: boolean;
  canceled?: boolean;
}) {
  const tutor = await user({ role: IUser.Role.Tutor });
  const student = await user({ role: IUser.Role.Student });
  const rule_ = await rule({ userId: tutor.id });
  const now = dayjs.utc();
  const start = future ? now.add(1, "week") : now.subtract(1, "week");
  const { lesson: lesson_, call } = await lesson({
    call: {
      host: tutor.id,
      members: [student.id],
      rule: rule_.id,
      start: start.toISOString(),
    },
    lesson: { host: tutor.id, members: [student.id] },
  });

  if (canceled) {
    await knex.transaction(async (tx: Knex.Transaction) => {
      await calls.cancel(call.self.id, tutor.id, tx);
      await lessons.cancel(lesson_.self.id, tutor.id, tx);
    });
  }

  return { lesson: lesson_, tutor, student, rule };
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
  rule,
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
  rule: number;
  duration?: ILesson.Duration;
  price?: number;
  canceled: {
    future: number[];
    past: number[];
  };
}): Promise<MakeLessonsReturn> {
  const lessons: MakeLessonsReturn = [];

  for (const [key, student] of entries(students)) {
    const index = Number(key);
    const futureLessonCount = future[index];
    const pastLessonCount = past[index];
    const canceledFutureLessonCount = canceled.future[index];
    const canceledPastLessonCount = canceled.past[index];

    const create = async (start: string) => {
      return await lesson({
        call: {
          host: tutor,
          members: [student],
          rule: rule,
          start,
          duration,
        },
        lesson: { host: tutor, members: [student], price },
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
        const lesson = futureLessons[i];
        if (!lesson) throw new Error("invalid future lesson index");
        await cancelLesson({
          lesson: lesson.lesson.self.id,
          call: lesson.call.self.id,
          user: tutor,
        });
        return lesson;
      })
    );

    // cancel past lessons
    const canceledPastLessons = await Promise.all(
      range(0, canceledPastLessonCount).map(async (i) => {
        const lesson = pastLessons[i];
        if (!lesson) throw new Error("invalid past lesson index");
        await cancelLesson({
          lesson: lesson.lesson.self.id,
          call: lesson.call.self.id,
          user: tutor,
        });
        return lesson;
      })
    );

    const canceledFutureLessonIds = canceledFutureLessons.map(
      (future) => future.lesson.self.id
    );
    const canceledPastLessonIds = canceledPastLessons.map(
      (past) => past.lesson.self.id
    );
    // filter out canceled future lessons
    const uncanceledFutureLessons = futureLessons.filter(
      (future) => !canceledFutureLessonIds.includes(future.lesson.self.id)
    );
    // filter out canceled past lessons
    const uncanceledPastLessons = pastLessons.filter(
      (past) => !canceledPastLessonIds.includes(past.lesson.self.id)
    );
    lessons.push({
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

  return lessons;
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
  const [firstUserId, secondUserId]: [number, number] = payload || [
    await tutor().then((user) => user.id),
    await student().then((user) => user.id),
  ];
  return await rooms.create([firstUserId, secondUserId]);
}

async function makeMessage(payload?: Partial<IMessage.CreatePayload>) {
  const roomId: number = payload?.roomId || (await makeRoom());
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
    }
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
  interviewer,
  students,
  interview,
  lesson,
  flush,
  topic,
  rule,
  room: makeRoom,
  message: makeMessage,
  make: {
    lesson: makeLesson,
    lessons: makeLessons,
    interviews: makeInterviews,
    tutors: makeTutors,
    rating: makeRating,
    ratings: makeRatings,
  },
  cancel: {
    lesson: cancelLesson,
  },
};
