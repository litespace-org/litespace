import { calls, knex, lessons, rules, users } from "@/index";
import { ICall, ILesson, IRule, IUser } from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";
import { entries, range, sample } from "lodash";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/sol";

export { faker } from "@faker-js/faker/locale/ar";

export async function flush() {
  await knex.transaction(async (tx) => {
    await calls.builder(tx).members.del();
    await calls.builder(tx).calls.del();
    await rules.builder(tx).del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
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

export async function user(role: IUser.Role) {
  return await users.create({
    email: faker.internet.email(),
    gender: gender(),
    name: faker.internet.userName(),
    password: faker.internet.password(),
    birthYear: faker.number.int({ min: 2000, max: 2024 }),
    role,
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

export async function lesson(payload?: {
  call?: Partial<ICall.CreatePayload>;
  lesson?: Partial<ILesson.CreatePayload>;
}) {
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
  return user(IUser.Role.Tutor);
}

function student() {
  return user(IUser.Role.Student);
}

async function students(count: number) {
  return await Promise.all(range(0, count).map(() => student()));
}

async function makeLesson({
  future,
  canceled,
}: {
  future?: boolean;
  canceled?: boolean;
}) {
  const tutor = await user(IUser.Role.Tutor);
  const student = await user(IUser.Role.Student);
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

async function makeLessons({
  tutor,
  students,
  rule,
  future,
  past,
  canceled,
  duration,
}: {
  tutor: number;
  students: number[];
  future: number[];
  past: number[];
  rule: number;
  duration?: ILesson.Duration;
  canceled: {
    future: number[];
    past: number[];
  };
}) {
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
        lesson: { host: tutor, members: [student] },
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
    await Promise.all(
      range(0, canceledFutureLessonCount).map((i) => {
        const lesson = futureLessons[i];
        if (!lesson) return;
        return cancelLesson({
          lesson: lesson.lesson.self.id,
          call: lesson.call.self.id,
          user: tutor,
        });
      })
    );

    // cancel past lessons
    await Promise.all(
      range(0, canceledPastLessonCount).map((i) => {
        const lesson = pastLessons[i];
        if (!lesson) return;
        return cancelLesson({
          lesson: lesson.lesson.self.id,
          call: lesson.call.self.id,
          user: tutor,
        });
      })
    );
  }
}

export default {
  user,
  tutor,
  student,
  students,
  lesson,
  flush,
  rule,
  make: {
    lesson: makeLesson,
    lessons: makeLessons,
  },
  cancel: {
    lesson: cancelLesson,
  },
};
