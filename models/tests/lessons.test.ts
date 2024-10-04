import { lessons } from "@/index";
import { expect } from "chai";
import fixtures, { MakeLessonsReturn } from "@fixtures/db";
import { ILesson, IUser } from "@litespace/types";
import { nameof } from "@litespace/sol";
import { concat, flatten, orderBy } from "lodash";
import dayjs from "@/lib/dayjs";

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
        const { tutor } = await fixtures.make.lesson({
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
        const { tutor } = await fixtures.make.lesson({
          future: true,
          canceled: false,
        });
        const count = await lessons.countTutorStudents({
          canceled: false,
          future: false,
          tutor: tutor.id,
        });
        expect(count).to.be.eq(0);
      });

      it("Should count future students when the `future` flag is enabled", async () => {
        const { tutor } = await fixtures.make.lesson({
          future: true,
          canceled: false,
        });
        const count = await lessons.countTutorStudents({
          canceled: false,
          future: true,
          tutor: tutor.id,
        });
        expect(count).to.be.eq(1);
      });

      it("Should count canceled students when the `canceled` flag is enabled", async () => {
        const { tutor } = await fixtures.make.lesson({
          future: false,
          canceled: true,
        });
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
        await fixtures.make.lessons({
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

  describe("Lessons Duration Sum & Lessons Count", () => {
    let tutor: IUser.Self;
    let tutorLessons: MakeLessonsReturn;
    const futureLessons = 8;
    const pastLessons = 13;
    const canceledFutureLessons = 3;
    const canceledPastLessons = 2;
    const duration = ILesson.Duration.Long;

    beforeEach(async () => {
      tutor = await fixtures.tutor();
      const students = await fixtures.students(5);
      const rule = await fixtures.rule({ userId: tutor.id });
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
        future: [2, 2, 2, 1, 1],
        past: [3, 3, 3, 2, 2],
        canceled: {
          future: [1, 1, 1, 0, 0],
          past: [0, 0, 0, 1, 1],
        },
        rule: rule.id,
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
        expect(await lessons.findLessonDays({ user: tutor.id })).to.be.empty;
      });

      it("should include future and canceled lessons by default", async () => {
        const test = tutorLessons.reduce(
          (list: ILesson.LessonDay[], lessons) => {
            const current = concat(lessons.past, lessons.future).map(
              ({ call }) => ({
                start: call.self.start,
                duration: call.self.duration,
              })
            );
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({ user: tutor.id });
        expect(data).to.be.of.length(futureLessons + pastLessons);
        expect(data).to.include.deep.members(test);
      });

      it("should ignore future lessons", async () => {
        const test = tutorLessons.reduce(
          (list: ILesson.LessonDay[], lessons) => {
            const current = concat(lessons.past).map(({ call }) => ({
              start: call.self.start,
              duration: call.self.duration,
            }));
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({
          user: tutor.id,
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
            ).map(({ call }) => ({
              start: call.self.start,
              duration: call.self.duration,
            }));
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({
          user: tutor.id,
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
            const current = concat(lessons.uncanceled.past).map(({ call }) => ({
              start: call.self.start,
              duration: call.self.duration,
            }));
            return concat(list, current);
          },
          []
        );
        const data = await lessons.findLessonDays({
          user: tutor.id,
          future: false,
          canceled: false,
        });
        expect(data).to.be.of.length(pastLessons - canceledPastLessons);
        expect(data).to.include.deep.members(test);
      });
    });
  });
});
