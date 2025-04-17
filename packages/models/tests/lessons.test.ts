import { lessons } from "@/index";
import { expect } from "chai";
import fixtures, { MakeLessonsReturn } from "@fixtures/db";
import { ILesson, ITutor } from "@litespace/types";
import { price } from "@litespace/utils/value";
import { nameof } from "@litespace/utils/utils";
import { concat, entries, first, sum } from "lodash";
import dayjs from "@/lib/dayjs";

const now = dayjs().utc();

function min(minutes: number) {
  return now.add(minutes, "minutes");
}

/**
 * Add `minutes` to the current time and convert it to iso date string.
 */
function imin(minutes: number) {
  return min(minutes).toISOString();
}

describe("Lessons", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(lessons.countCounterpartMembers), () => {
    describe("Simple (one student, one tutor)", () => {
      it("should count one unique student for the tutor", async () => {
        const tutor = await fixtures.tutor();
        const student = await fixtures.student();

        await fixtures.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "past",
          canceled: false,
        });

        const count = await lessons.countCounterpartMembers({
          canceled: false,
          future: false,
          user: tutor.id,
        });

        expect(count).to.be.eq(1);

        expect(
          await lessons.countCounterpartMembers({
            canceled: false,
            future: false,
            user: student.id,
          })
        ).to.be.eq(1);
      });

      it("should count no student if the lesson will happen in the future", async () => {
        const tutor = await fixtures.tutor();

        await fixtures.lesson({
          timing: "future",
          canceled: false,
          tutor: tutor.id,
        });

        const count = await lessons.countCounterpartMembers({
          canceled: false,
          future: false,
          user: tutor.id,
        });
        expect(count).to.be.eq(0);
      });

      it("should count future students/tutors when the `future` flag is enabled", async () => {
        const tutor = await fixtures.tutor();
        const student = await fixtures.student();

        await fixtures.lesson({
          timing: "future",
          canceled: false,
          tutor: tutor.id,
          student: student.id,
        });

        expect(
          await lessons.countCounterpartMembers({
            canceled: false,
            future: true,
            user: tutor.id,
          })
        ).to.be.eq(1);

        expect(
          await lessons.countCounterpartMembers({
            canceled: true,
            future: true,
            past: false,
            ratified: false,
            user: tutor.id,
          })
        ).to.be.eq(0);

        expect(
          await lessons.countCounterpartMembers({
            canceled: false,
            future: true,
            user: student.id,
          })
        ).to.be.eq(1);

        expect(
          await lessons.countCounterpartMembers({
            canceled: true,
            future: true,
            ratified: false,
            past: false,
            user: student.id,
          })
        ).to.be.eq(0);
      });

      it("should count canceled students/tutors when the `canceled` flag is enabled", async () => {
        const tutor = await fixtures.tutor();
        const student = await fixtures.student();

        await fixtures.lesson({
          timing: "future",
          canceled: true,
          tutor: tutor.id,
          student: student.id,
        });

        expect(
          await lessons.countCounterpartMembers({
            canceled: true,
            future: true,
            user: tutor.id,
          })
        ).to.be.eq(1);

        expect(
          await lessons.countCounterpartMembers({
            canceled: true,
            future: true,
            user: student.id,
          })
        ).to.be.eq(1);
      });
    });

    describe("Complex (Many students)", () => {
      it("should count unique students", async () => {
        const tutor = await fixtures.tutor();
        const students = await fixtures.students(3);
        const slot = await fixtures.slot({ userId: tutor.id });
        const futureLessons = [1, 2, 3];
        const pastLessons = [3, 2, 1];

        /**
         * 3 students
         *
         * First student: 1 future lesson (not canceled), 3 past lessons (2 canceled)
         * Second student: 2 future lessons (1 canceled), 2 past lessons (1 canceled)
         * Third student: 3 future lessons (2 canceled), 1 past lesson  (canceled)
         */
        await fixtures.make.lessons({
          tutor: tutor.id,
          students: students.map((student) => student.id),
          future: futureLessons,
          past: pastLessons,
          canceled: {
            future: [0, 1, 2],
            past: [2, 1, 1],
          },
          slot: slot.id,
        });

        for (const [_, student] of entries(students)) {
          expect(
            await lessons.countCounterpartMembers({
              user: student.id,
              future: true,
              past: false, // only execlude past lessons
              canceled: true,
              ratified: true,
            })
          ).to.be.eq(1);
        }

        expect(
          await lessons.countCounterpartMembers({
            user: tutor.id,
            future: true,
            canceled: true,
          })
        ).to.be.eq(3);

        expect(
          await lessons.countCounterpartMembers({
            user: tutor.id,
            future: false,
            canceled: true,
          })
        ).to.be.eq(3);

        expect(
          await lessons.countCounterpartMembers({
            user: tutor.id,
            future: true,
            canceled: false,
          })
        ).to.be.eq(3);
      });
    });

    it("should count tutors that students has lessons with", async () => {
      const student = await fixtures.student();
      const tutors = await fixtures.make.tutors(2);

      for (const tutor of tutors) {
        const slot = await fixtures.slot({
          userId: tutor.id,
        });

        await fixtures.lesson({
          tutor: tutor.id,
          student: student.id,
          slot: slot.id,
        });
      }

      expect(
        await lessons.countCounterpartMembers({
          user: student.id,
        })
      ).to.be.eq(2);
    });
  });

  describe("Lessons Duration Sum, Lessons Count, Lesson Days, and Price", () => {
    let tutor: ITutor.Self;
    let tutorLessons: MakeLessonsReturn;
    const futureLessons = 8;
    const pastLessons = 13;
    const canceledFutureLessons = 3;
    const canceledPastLessons = 2;
    const duration = ILesson.Duration.Long;
    const lessonPrice = price.scale(100);

    beforeEach(async () => {
      tutor = await fixtures.tutor();
      const students = await fixtures.students(5);
      const slot = await fixtures.slot({ userId: tutor.id });
      /**
       * - 5 students
       * - 8 future lessons
       * - 13 past lessons
       * - 3 future canceled lessons
       * - 2 past canceled lessons
       */
      tutorLessons = await fixtures.make.lessons({
        tutor: tutor.id,
        students: students.map((student) => student.id),
        duration,
        price: lessonPrice,
        future: [2, 2, 2, 1, 1],
        past: [3, 3, 3, 2, 2],
        canceled: {
          future: [1, 1, 1, 0, 0],
          past: [0, 0, 0, 1, 1],
        },
        slot: slot.id,
      });
    });

    describe(nameof(lessons.sumPrice), () => {
      it("should return empty result if not lessons", async () => {
        const tutor = await fixtures.tutor();
        expect(await lessons.sumPrice({ users: [tutor.id] })).to.be.eq(0);
      });

      it("should include future and canceled lessons by default", async () => {
        const total = (futureLessons + pastLessons) * lessonPrice;
        expect(await lessons.sumPrice({ users: [tutor.id] })).to.be.eq(total);
      });

      it("should ignore future lessons", async () => {
        const total = pastLessons * lessonPrice;
        expect(
          await lessons.sumPrice({ users: [tutor.id], future: false })
        ).to.be.eq(total);
      });

      it("should ignore canceled lessons", async () => {
        const total =
          (futureLessons +
            pastLessons -
            canceledFutureLessons -
            canceledPastLessons) *
          lessonPrice;
        expect(
          await lessons.sumPrice({
            users: [tutor.id],
            canceled: false,
          })
        ).to.be.eq(total);
      });

      it("should ignore canceled and future lessons (past uncanceled)", async () => {
        const total = (pastLessons - canceledPastLessons) * lessonPrice;
        expect(
          await lessons.sumPrice({
            users: [tutor.id],
            future: false,
            canceled: false,
          })
        ).to.be.eq(total);
      });
    });

    describe(nameof(lessons.sumDuration), () => {
      it("should return zero in case no lesson", async () => {
        // fresh tutor with no lessons
        const t2 = await fixtures.tutor();
        expect(
          await lessons.sumDuration({
            users: [t2.id],
          })
        ).to.be.eq(0);
      });

      it("should include future and canceled lessons by default", async () => {
        const total = (pastLessons + futureLessons) * duration;
        expect(
          await lessons.sumDuration({
            users: [tutor.id],
          })
        ).to.be.eq(total);
      });

      it("should ignore future lessons", async () => {
        expect(
          await lessons.sumDuration({
            users: [tutor.id],
            future: false,
          })
        ).to.be.eq(pastLessons * duration);
      });

      it("should ignore canceled lessons", async () => {
        const totalLessons =
          futureLessons +
          pastLessons -
          canceledFutureLessons -
          canceledPastLessons;
        const totalDuration = totalLessons * duration;

        expect(
          await lessons.sumDuration({
            users: [tutor.id],
            canceled: false,
          })
        ).to.be.eq(totalDuration);
      });

      it("should ignore future and canceled lessons", async () => {
        const totalLessons = pastLessons - canceledPastLessons;
        const totalDuration = totalLessons * duration;
        expect(
          await lessons.sumDuration({
            users: [tutor.id],
            future: false,
            canceled: false,
          })
        ).to.be.eq(totalDuration);
      });
    });

    describe(nameof(lessons.countLessons), () => {
      it("should return zero in case no lesson", async () => {
        // fresh tutor with no lessons
        const t2 = await fixtures.tutor();
        expect(await lessons.countLessons({ users: [t2.id] })).to.be.eq(0);
      });

      it("should include future and canceled lessons by default", async () => {
        const total = pastLessons + futureLessons;
        expect(await lessons.countLessons({ users: [tutor.id] })).to.be.eq(
          total
        );
      });

      it("should ignore future lessons", async () => {
        expect(
          await lessons.countLessons({ users: [tutor.id], future: false })
        ).to.be.eq(pastLessons);
      });

      it("should ignore canceled lessons", async () => {
        const totalLessons =
          futureLessons +
          pastLessons -
          canceledFutureLessons -
          canceledPastLessons;

        expect(
          await lessons.countLessons({ users: [tutor.id], canceled: false })
        ).to.be.eq(totalLessons);
      });

      it("should ignore future and canceled lessons", async () => {
        const totalLessons = pastLessons - canceledPastLessons;
        expect(
          await lessons.countLessons({
            users: [tutor.id],
            future: false,
            canceled: false,
          })
        ).to.be.eq(totalLessons);
      });
    });

    describe(nameof(lessons.findLessonDays), () => {
      it("should return empty result if not lessons", async () => {
        const tutor = await fixtures.tutor();
        expect(await lessons.findLessonDays({ users: [tutor.id] })).to.be.empty;
      });

      it("should include future and canceled lessons by default", async () => {
        const test = tutorLessons.reduce(
          (list: ILesson.LessonDay[], lessons) => {
            const current = concat(lessons.past, lessons.future).map(
              ({ lesson }) => ({
                start: lesson.start,
                duration: lesson.duration,
              })
            );
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({ users: [tutor.id] });
        expect(data).to.be.of.length(futureLessons + pastLessons);
        expect(data).to.include.deep.members(test);
      });

      it("should ignore future lessons", async () => {
        const test = tutorLessons.reduce(
          (list: ILesson.LessonDay[], lessons) => {
            const current = concat(lessons.past).map(({ lesson }) => ({
              start: lesson.start,
              duration: lesson.duration,
            }));
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({
          users: [tutor.id],
          future: false,
        });
        expect(data).to.be.of.length(pastLessons);
        expect(data).to.include.deep.members(test);
      });

      it("should ignore canceled lessons", async () => {
        const test = tutorLessons.reduce(
          (list: ILesson.LessonDay[], lessons) => {
            const current = concat(
              lessons.uncanceled.future,
              lessons.uncanceled.past
            ).map(({ lesson }) => ({
              start: lesson.start,
              duration: lesson.duration,
            }));
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({
          users: [tutor.id],
          canceled: false,
        });
        expect(data).to.be.of.length(
          futureLessons +
            pastLessons -
            canceledFutureLessons -
            canceledPastLessons
        );
        expect(data).to.include.deep.members(test);
      });

      it("should ignore future and canceled lessons", async () => {
        const test = tutorLessons.reduce(
          (list: ILesson.LessonDay[], lessons) => {
            const current = concat(lessons.uncanceled.past).map(
              ({ lesson }) => ({
                start: lesson.start,
                duration: lesson.duration,
              })
            );
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({
          users: [tutor.id],
          future: false,
          canceled: false,
        });
        expect(data).to.be.of.length(pastLessons - canceledPastLessons);
        expect(data).to.include.deep.members(test);
      });
    });
  });

  describe(nameof(lessons.find), () => {
    it("should return empty list in case user has not lessons", async () => {
      const result = await lessons.find({
        users: [1],
      });
      expect(result.list).to.be.empty;
      expect(result.total).to.be.eq(0);
    });

    it("should return empty list in case the database is empty", async () => {
      const result = await lessons.find({});
      expect(result.list).to.be.empty;
      expect(result.total).to.be.eq(0);
    });

    it("should find all lessons in the database", async () => {
      const tutor = await fixtures.tutor();
      const students = await fixtures.students(5);
      const slot = await fixtures.slot({ userId: tutor.id });
      const future = [2, 2, 2, 1, 1];
      const past = [3, 3, 3, 2, 2];
      const total = sum(future) + sum(past);

      await fixtures.make.lessons({
        tutor: tutor.id,
        students: students.map((student) => student.id),
        future,
        past,
        canceled: {
          future: [1, 1, 1, 0, 0],
          past: [0, 0, 0, 1, 1],
        },
        slot: slot.id,
      });

      const result = await lessons.find({ size: 100 });

      expect(result.list).to.be.of.length(total);
      expect(result.total).to.be.eq(total);
    });

    it("should find all lessons in the database (with pagination)", async () => {
      const tutor = await fixtures.tutor();
      const students = await fixtures.students(2);
      const slot = await fixtures.slot({ userId: tutor.id });
      const future = [2, 2];
      const past = [3, 4];
      const total = sum(future) + sum(past); // 11

      await fixtures.make.lessons({
        tutor: tutor.id,
        students: students.map((student) => student.id),
        future,
        past,
        canceled: {
          future: [1, 1],
          past: [0, 0],
        },
        slot: slot.id,
      });

      const r1 = await lessons.find({ page: 1, size: 2 });
      expect(r1.list).to.be.of.length(2);
      expect(r1.total).to.be.eq(total);

      const r2 = await lessons.find({ page: 2, size: 2 });
      expect(r2.list).to.be.of.length(2);
      expect(r2.total).to.be.eq(total);

      const r3 = await lessons.find({ page: 6, size: 2 });
      expect(r3.list).to.be.of.length(1);
      expect(r3.total).to.be.eq(total);
    });

    it("should filter users lessons using `future`, `past`, `ratified` and `canceled` flags", async () => {
      const tutor = await fixtures.tutor();
      const students = await fixtures.students(2);
      const slot = await fixtures.slot({ userId: tutor.id });
      const future = [2, 2];
      const past = [3, 4];

      await fixtures.make.lessons({
        tutor: tutor.id,
        students: students.map((student) => student.id),
        future,
        past,
        canceled: {
          future: [1, 1],
          past: [0, 0],
        },
        slot: slot.id,
      });

      const tests = [
        {
          future: true,
          past: true,
          ratified: true,
          canceled: true,
          count: 11,
        },
        {
          future: false,
          past: true,
          ratified: true,
          canceled: true,
          count: 7,
        },
        {
          future: true,
          past: false,
          ratified: true,
          canceled: true,
          count: 4,
        },
        {
          future: true,
          past: true,
          ratified: false,
          canceled: true,
          count: 2,
        },
        {
          future: true,
          past: true,
          ratified: true,
          canceled: false,
          count: 9,
        },
        {
          future: false,
          past: false,
          ratified: true,
          canceled: false,
          count: 9,
        },
        {
          future: false,
          past: false,
          ratified: false,
          canceled: false,
          count: 11,
        },
        {
          future: true,
          past: false,
          ratified: false,
          canceled: true,
          count: 2,
        },
        {
          future: false,
          past: true,
          ratified: false,
          canceled: true,
          count: 0,
        },
      ];

      for (const test of tests) {
        const result = await lessons.find({
          page: 1,
          size: 100,
          future: test.future,
          past: test.past,
          ratified: test.ratified,
          canceled: test.canceled,
        });
        expect(result.list).to.be.of.length(test.count);
        expect(result.total).to.be.eq(test.count);
      }
    });

    it("should filter lessons between `before` and `after` dates", async () => {
      const tutor = await fixtures.tutor();
      const slot = await fixtures.slot({ userId: tutor.id });
      const student = await fixtures.student();
      const date = dayjs.utc().startOf("day");

      // create 24 lessons (30 minute each) across the day
      for (let i = 0; i < 24; i++) {
        await fixtures.lesson({
          slot: slot.id,
          start: date.add(i, "hour").toISOString(),
          duration: 30,
          tutor: tutor.id,
          student: student.id,
        });
      }

      const tests = [
        // include all 24 lessons in the day
        {
          after: date.toISOString(),
          before: date.add(24, "hours").toISOString(),
          count: 24,
        },
        // skip the first lesson in the day
        {
          after: date.add(1, "hour").toISOString(),
          before: date.add(1, "day").toISOString(),
          count: 23,
        },
        // include first lesson incase it is not eneded yet.
        {
          after: date.add(15, "minutes").toISOString(),
          before: date.add(1, "day").toISOString(),
          count: 24,
        },
        // include last lesson incase it is not eneded yet.
        {
          after: date.toISOString(),
          before: date.add(23.25, "hours").toISOString(),
          count: 24,
        },
        // execlude last lesson in case it is ended
        {
          after: date.toISOString(),
          before: date.add(22.9, "hours").toISOString(),
          count: 23,
        },
      ];

      for (const test of tests) {
        const found = await lessons.find({
          users: [tutor.id],
          size: 50,
          after: test.after,
          before: test.before,
        });
        expect(found.total).to.eq(test.count);
      }
    });

    it("should filter lessons that all totally or partially before `after` when providing the `strict` flag", async () => {
      await fixtures.lesson({ start: imin(0), duration: 30 });
      await fixtures.lesson({ start: imin(15), duration: 30 });
      await fixtures.lesson({ start: imin(30), duration: 30 });

      expect(
        await lessons.find({ after: imin(5) }).then((result) => result.list)
      ).to.be.of.length(3);

      expect(
        await lessons.find({ after: imin(15) }).then((result) => result.list)
      ).to.be.of.length(3);

      expect(
        await lessons
          .find({ after: imin(15), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(2);

      expect(
        await lessons
          .find({ after: imin(30), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(1);

      expect(
        await lessons
          .find({ after: imin(31), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(0);
    });

    it("should filter lessons that all totally or partially after `before` when providing the `strict` flag", async () => {
      await fixtures.lesson({ start: imin(0), duration: 30 });
      await fixtures.lesson({ start: imin(15), duration: 30 });
      await fixtures.lesson({ start: imin(30), duration: 30 });

      expect(
        await lessons.find({ before: imin(5) }).then((result) => result.list)
      ).to.be.of.length(1);

      expect(
        await lessons.find({ before: imin(16) }).then((result) => result.list)
      ).to.be.of.length(2);

      expect(
        await lessons.find({ before: imin(30) }).then((result) => result.list)
      ).to.be.of.length(2);

      expect(
        await lessons.find({ before: imin(60) }).then((result) => result.list)
      ).to.be.of.length(3);

      expect(
        await lessons
          .find({ before: imin(5), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(0);

      expect(
        await lessons
          .find({ before: imin(16), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(0);

      expect(
        await lessons
          .find({ before: imin(30), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(1);

      expect(
        await lessons
          .find({ before: imin(45), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(2);

      expect(
        await lessons
          .find({ before: imin(60), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(3);
    });

    it("should filter lessons that all totally or partially after `before` and before `after` when providing the `strict` flag", async () => {
      await fixtures.lesson({ start: imin(0), duration: 15 });
      await fixtures.lesson({ start: imin(0), duration: 30 });
      await fixtures.lesson({ start: imin(15), duration: 30 });
      await fixtures.lesson({ start: imin(30), duration: 30 });

      expect(
        await lessons
          .find({ after: imin(0), before: imin(31) })
          .then((result) => result.list)
      ).to.be.of.length(4);

      expect(
        await lessons
          .find({ after: imin(5), before: imin(45) })
          .then((result) => result.list)
      ).to.be.of.length(4);

      expect(
        await lessons
          .find({ after: imin(5), before: imin(45), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(1);

      expect(
        await lessons
          .find({ after: imin(5), before: imin(60), strict: true })
          .then((result) => result.list)
      ).to.be.of.length(2);
    });

    it("should tutor lessons with pagination", async () => {
      const firstTutor = await fixtures.tutor();
      const firstTutorStudents = await fixtures.students(2);
      const firstTutorSlot = await fixtures.slot({ userId: firstTutor.id });
      const firstTutorFutureLesson = [2, 2];
      const firstTutorPastLessons = [3, 4];
      const firstTutorTotaLessons =
        sum(firstTutorFutureLesson) + sum(firstTutorPastLessons); // 11

      await fixtures.make.lessons({
        tutor: firstTutor.id,
        students: firstTutorStudents.map((student) => student.id),
        future: firstTutorFutureLesson,
        past: firstTutorPastLessons,
        canceled: {
          future: [1, 1],
          past: [0, 0],
        },
        slot: firstTutorSlot.id,
      });

      const secondTutor = await fixtures.tutor();
      const secondTutorStudents = await fixtures.students(2);
      const secondTutorSlot = await fixtures.slot({ userId: secondTutor.id });
      const secondTutorFutureLessons = [1, 1];
      const secondTutorPastLessons = [2, 3];
      const secondTutorTotaLessons =
        sum(secondTutorFutureLessons) + sum(secondTutorPastLessons); // 7

      await fixtures.make.lessons({
        tutor: secondTutor.id,
        students: secondTutorStudents.map((student) => student.id),
        future: secondTutorFutureLessons,
        past: secondTutorPastLessons,
        canceled: {
          future: [1, 1],
          past: [0, 0],
        },
        slot: secondTutorSlot.id,
      });

      const tests = [
        {
          users: [firstTutor.id],
          page: 1,
          size: 2,
          list: 2,
          total: firstTutorTotaLessons,
        },
        {
          users: [firstTutor.id],
          page: 2,
          size: 2,
          list: 2,
          total: firstTutorTotaLessons,
        },
        {
          users: [firstTutor.id],
          page: 6,
          size: 2,
          list: 1,
          total: firstTutorTotaLessons,
        },
        {
          users: [secondTutor.id],
          page: 1,
          size: 2,
          list: 2,
          total: secondTutorTotaLessons,
        },
        {
          users: [secondTutor.id],
          page: 4,
          size: 2,
          list: 1,
          total: secondTutorTotaLessons,
        },
        {
          size: 100,
          list: firstTutorTotaLessons + secondTutorTotaLessons,
          total: firstTutorTotaLessons + secondTutorTotaLessons,
        },
      ];

      for (const test of tests) {
        const result = await lessons.find({
          users: test.users,
          page: test.page,
          size: test.size,
        });
        expect(result.list).to.be.of.length(test.list);
        expect(result.total).to.be.eq(test.total);
      }
    });
  });

  describe(nameof(lessons.countCounterpartMembersBatch), () => {
    it("should retieve the number of students a tutor", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();

      await fixtures.lesson({
        tutor: tutor.id,
        student: student.id,
        timing: "past",
        canceled: false,
      });

      const studentsCount = await lessons.countCounterpartMembersBatch({
        users: [tutor.id],
      });
      expect(first(studentsCount)?.userId).to.eq(tutor.id);
      expect(first(studentsCount)?.count).to.eq(1);
    });
  });

  describe(nameof(lessons.update), () => {
    it("should successfully update lesson data", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();

      const { lesson } = await fixtures.lesson({
        tutor: tutor.id,
        student: student.id,
        duration: ILesson.Duration.Long,
        timing: "past",
        canceled: false,
      });

      const startDate = dayjs.utc().add(2, "days").toISOString();
      await lessons.update(lesson.id, {
        start: startDate,
        duration: ILesson.Duration.Short,
      });

      const updated = await lessons.findById(lesson.id);

      expect(updated).to.not.be.null;
      expect(updated?.id).to.eq(lesson.id);
      expect(updated?.duration).to.eq(ILesson.Duration.Short);
      expect(dayjs(updated?.updatedAt).isAfter(lesson.updatedAt)).to.be.true;

      expect(updated?.price).to.eq(lesson.price);
      expect(updated?.slotId).to.eq(lesson.slotId);
      expect(updated?.canceledAt).to.eq(lesson.canceledAt);
      expect(updated?.canceledBy).to.eq(lesson.canceledBy);
    });
  });
});
