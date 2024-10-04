import { calls, knex, lessons, users } from "@/index";
import { expect } from "chai";
import fixtures from "@fixtures/db";
import { ILesson, IUser } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { nameof } from "@litespace/sol";
import { Knex } from "knex";
import { range, entries } from "lodash";

async function makeLesson({
  future,
  canceled,
}: {
  future?: boolean;
  canceled?: boolean;
}) {
  const tutor = await fixtures.user(IUser.Role.Tutor);
  const student = await fixtures.user(IUser.Role.Student);
  const rule = await fixtures.rule({ userId: tutor.id });
  const now = dayjs.utc();
  const start = future ? now.add(1, "week") : now.subtract(1, "week");
  const { lesson, call } = await fixtures.lesson({
    call: {
      host: tutor.id,
      members: [student.id],
      rule: rule.id,
      start: start.toISOString(),
    },
    lesson: { host: tutor.id, members: [student.id] },
  });

  if (canceled) {
    await knex.transaction(async (tx: Knex.Transaction) => {
      await calls.cancel(call.self.id, tutor.id, tx);
      await lessons.cancel(lesson.self.id, tutor.id, tx);
    });
  }

  return { lesson, tutor, student, rule };
}

async function makeLessons({
  tutor,
  students,
  rule,
  future,
  past,
  canceled,
}: {
  tutor: number;
  students: number[];
  future: number[];
  past: number[];
  rule: number;
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
      return await fixtures.lesson({
        call: { host: tutor, members: [student], rule: rule, start },
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
        return fixtures.cancel.lesson({
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
        return fixtures.cancel.lesson({
          lesson: lesson.lesson.self.id,
          call: lesson.call.self.id,
          user: tutor,
        });
      })
    );
  }
}

describe("Lessons", () => {
  beforeAll(async () => {
    await fixtures.flush();
  });

  afterEach(async () => {
    await fixtures.flush();
  });

  describe(nameof(lessons.countTutorStudents), () => {
    describe("Simple (one student)", () => {
      it("Should count one unique student for the tutor", async () => {
        const { tutor } = await makeLesson({
          future: false,
          canceled: false,
        });

        const count = await lessons.countTutorStudents({
          canceled: false,
          future: false,
          tutor: tutor.id,
        });

        expect(count).to.be.eq(1);
      });

      it("Should count no student if the lesson will happen in the future", async () => {
        const { tutor } = await makeLesson({ future: true, canceled: false });
        const count = await lessons.countTutorStudents({
          canceled: false,
          future: false,
          tutor: tutor.id,
        });
        expect(count).to.be.eq(0);
      });

      it("Should count future students when the `future` flag is enabled", async () => {
        const { tutor } = await makeLesson({ future: true, canceled: false });
        const count = await lessons.countTutorStudents({
          canceled: false,
          future: true,
          tutor: tutor.id,
        });
        expect(count).to.be.eq(1);
      });

      it("Should count canceled students when the `canceled` flag is enabled", async () => {
        const { tutor } = await makeLesson({ future: false, canceled: true });
        const count = await lessons.countTutorStudents({
          canceled: true,
          future: true,
          tutor: tutor.id,
        });
        expect(count).to.be.eq(1);
      });
    });

    describe("Complex (Many students)", () => {
      it("should count unique students", async () => {
        const tutor = await fixtures.tutor();
        const students = await fixtures.students(3);
        const rule = await fixtures.rule({ userId: tutor.id });

        /**
         * 3 students
         *
         * First student: 1 future lesson (not canceled), 3 past lessons (2 canceled)
         * Second student: 2 future lessons (1 canceled), 2 past lessons (1 canceled)
         * Third student: 3 future lessons (2 canceled), 1 past lesson  (canceled)
         */
        await makeLessons({
          tutor: tutor.id,
          students: students.map((student) => student.id),
          future: [1, 2, 3],
          past: [3, 2, 1],
          canceled: {
            future: [0, 1, 2],
            past: [2, 1, 1],
          },
          rule: rule.id,
        });

        expect(
          await lessons.countTutorStudents({
            tutor: tutor.id,
            future: true,
            canceled: true,
          })
        ).to.be.eq(3);

        expect(
          await lessons.countTutorStudents({
            tutor: tutor.id,
            future: false,
            canceled: true,
          })
        ).to.be.eq(3);

        expect(
          await lessons.countTutorStudents({
            tutor: tutor.id,
            future: true,
            canceled: false,
          })
        ).to.be.eq(3);
      });
    });
  });
});
