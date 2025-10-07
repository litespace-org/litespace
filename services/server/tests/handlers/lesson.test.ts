import { mockApi, mockApiContext } from "@fixtures/mockApi";
import { expect } from "chai";
import { cache } from "@/lib/cache";
import db from "@fixtures/db";
import handlers from "@/handlers/lesson";
import {
  notfound,
  forbidden,
  busyTutor,
  bad,
  lessonTimePassed,
  noEnoughMinutes,
  weekBoundariesViolation,
} from "@/lib/error/api";
import {
  dayjs,
  getSubSlots,
  nameof,
  safe,
  UNCANCELLABLE_LESSON_HOURS,
} from "@litespace/utils";
import { ILesson, IUser } from "@litespace/types";
import { lessons } from "@litespace/models";
import { first, last } from "lodash";

const findLessons = mockApi<
  object,
  object,
  ILesson.FindLessonsApiQuery,
  ILesson.FindUserLessonsApiResponse
>(handlers.findLessons);

const createLesson = mockApi<ILesson.CreateApiPayload>(
  handlers.create(mockApiContext())
);

const updateLesson = mockApi<ILesson.UpdateApiPayload>(
  handlers.update(mockApiContext())
);

const cancelLesson = mockApi<object, { lessonId: number }>(handlers.cancel);

// TODO: write unit tests for handlers.report

const findAttendedLessonsStats = mockApi<
  object,
  object,
  ILesson.FindAttendedLessonsStatsApiQuery,
  ILesson.FindAttendedLessonsStatsApiResponse
>(handlers.findAttendedLessonsStats);

describe("Lessons API", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await db.flush();
    await cache.flush();
  });

  describe(nameof(createLesson), () => {
    it("should filter lessons using the `after` and `before` flag", async () => {
      const tutor = await db.tutorUser();

      const date = dayjs.utc().add(1, "hour").startOf("hour");
      const lessonsCount = 10;

      const slot = await db.slot({
        userId: tutor.id,
        start: date.toISOString(),
        end: date.add(lessonsCount / 2, "hour").toISOString(),
      });

      const subslots = getSubSlots(slot, 30);

      for (const subslot of subslots) {
        await db.lesson({
          start: subslot.start,
          slot: slot.id,
          duration: 30,
          tutor: tutor.id,
        });
      }

      const tests = [
        {
          after: first(subslots)?.start,
          before: last(subslots)?.end,
          total: lessonsCount,
        },
        {
          after: first(subslots)?.start,
          before: first(subslots)?.end,
          total: 1,
        },
        // skip first two lessons
        {
          after: subslots[2].start,
          before: last(subslots)?.end,
          total: lessonsCount - 2,
        },
        // skip last two lessons
        {
          after: subslots[0].start,
          before: subslots[subslots.length - 2].start,
          total: lessonsCount - 2,
        },
      ];

      for (const test of tests) {
        const found = await findLessons({
          user: tutor,
          query: {
            users: [tutor.id],
            after: test.after,
            before: test.before,
          },
        });
        expect(found).to.not.be.instanceof(Error);
        expect(found.body!.total).to.be.eq(test.total);
      }
    });
  });

  describe(nameof(createLesson), () => {
    it("should respond with forbidden in case the user is not student", async () => {
      const users = await Promise.all([
        db.user({ role: IUser.Role.Tutor }),
        db.user({ role: IUser.Role.TutorManager }),
        db.user({ role: IUser.Role.RegularAdmin }),
        db.user({ role: IUser.Role.SuperAdmin }),
      ]);

      const tutor = await db.tutor();
      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "day").toISOString(),
      });

      for (const user of users) {
        const res = await createLesson({
          user,
          body: {
            tutorId: tutor.id,
            slotId: slot.id,
            start: slot.start,
            duration: ILesson.Duration.Short,
          },
        });
        expect(res).to.deep.eq(forbidden());
      }
    });

    it("should respond with tutor notfound in case the tutorId is not found", async () => {
      const student = await db.subStudent();

      await db.subscription({
        userId: student.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: 3214,
          slotId: 4132,
          start: dayjs().add(1, "hour").toISOString(),
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(notfound.tutor());
    });

    it("should respond with slot notfound in case the slotId is not found", async () => {
      const student = await db.subStudent();
      const tutor = await db.tutor();

      await db.subscription({
        userId: student.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: 3214,
          start: dayjs().add(1, "hour").toISOString(),
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with bad in case the start date is before now", async () => {
      const student = await db.subStudent();

      await db.subscription({
        userId: student.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const tutor = await db.tutor();
      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs().subtract(1, "hour").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(bad());
    });

    it("should respond with busyTutor in case the tutor has already a lesson at the specified time", async () => {
      const student = await db.subStudent();
      const tutor = await db.tutorManager();

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "day").toISOString(),
      });

      await db.lesson({
        student: student.id,
        tutor: tutor.id,
        slot: slot.id,
        start: slot.start,
      });

      const student2 = await db.subStudent();

      await db.subscription({
        userId: student2.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const res = await createLesson({
        user: student2,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(busyTutor());
    });

    it("should respond with noEnoughMinutes in case the student remaining minutes quota is less than the lesson dur", async () => {
      const student = await db.student();
      const tutor = await db.tutor();
      const slot = await db.slot({ userId: tutor.id });

      const start = dayjs().startOf("week");

      // create a one week subscription
      const sub = await db.subscription({
        userId: student.id,
        start: start.toISOString(),
        end: start.add(1, "week").toISOString(),
      });

      for (let i = 0; i < Math.ceil(sub.weeklyMinutes / 30); i++) {
        await db.lesson({
          student: student.id,
          tutor: tutor.id,
          start: start.add(i * 30, "minute").toISOString(),
          duration: ILesson.Duration.Long,
        });
      }

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(noEnoughMinutes());
    });

    it("should respond with weekBoundariesViolation in case the lesson doesn't start within the current week", async () => {
      const student = await db.student();
      const start = dayjs().startOf("week");
      await db.subscription({
        userId: student.id,
        start: start.toISOString(),
        end: start.add(2, "week").toISOString(),
        weeklyMinutes: 120,
      });

      const tutor = await db.tutor();
      const slot = await db.slot({
        userId: tutor.id,
        start: start.add(7, "day").toISOString(),
        end: start.add(8, "day").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(weekBoundariesViolation());
    });

    // skipped because of the changes in booking policy
    it.skip("should successfully create the lesson when an unsubscribed student books a lesson with a tutor-manager", async () => {
      const student = await db.student();

      const tutor = await db.tutorManager();
      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "day").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.status).to.eq(200);
    });

    it("should successfully create the lesson when a subscribed student books a lesson with a regular tutor", async () => {
      const student = await db.student();
      await db.subscription({
        userId: student.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const tutor = await db.tutor();
      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "day").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.status).to.eq(200);
    });

    it("should successfully create the lesson when a subscribed student books a lesson with a tutor-manager", async () => {
      const student = await db.student();
      await db.subscription({
        userId: student.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const tutor = await db.tutorManager();
      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "day").toISOString(),
      });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.status).to.eq(200);
    });

    it("should successfully create more than one lesson when its a subscribed student", async () => {
      const student = await db.student();
      await db.subscription({
        userId: student.id,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "week").toISOString(),
      });

      const tutor1 = await db.tutorManager();
      const slot1 = await db.slot({
        userId: tutor1.id,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "day").toISOString(),
      });

      const res1 = await createLesson({
        user: student,
        body: {
          tutorId: tutor1.id,
          slotId: slot1.id,
          start: slot1.start,
          duration: ILesson.Duration.Short,
        },
      });
      expect(res1).to.not.be.instanceof(Error);
      expect(res1.status).to.eq(200);

      const tutor2 = await db.tutorManager();
      const slot2 = await db.slot({
        userId: tutor2.id,
        start: dayjs().add(3, "day").toISOString(),
        end: dayjs().add(4, "day").toISOString(),
      });

      const res2 = await createLesson({
        user: student,
        body: {
          tutorId: tutor2.id,
          slotId: slot2.id,
          start: slot2.start,
          duration: ILesson.Duration.Short,
        },
      });
      expect(res2).to.not.be.instanceof(Error);
      expect(res2.status).to.eq(200);
    });
  });

  describe(nameof(updateLesson), () => {
    it("should respond with forbidden in case the requester is not a student.", async () => {
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: 123,
            start: dayjs().toISOString(),
            duration: 30,
            slotId: 1,
          },
          user: IUser.Role.Tutor,
        })
      );
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the requester is not a member of the lesson.", async () => {
      const tutor = await db.tutor();
      const { lesson } = await db.lesson({ tutor: tutor.id });

      const student = await db.student();
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson.id,
            start: dayjs().toISOString(),
            duration: lesson.duration,
            slotId: lesson.slotId,
          },
          user: student,
        })
      );

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with not found in case the lesson does not exist.", async () => {
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: 123,
            start: dayjs().toISOString(),
            duration: 30,
            slotId: 1,
          },
          user: IUser.Role.Student,
        })
      );
      expect(res).to.deep.eq(notfound.lesson());
    });

    it("should respond with not found in case the lesson slot does not exist.", async () => {
      const tutor = await db.tutor();
      const student = await db.student();
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
      });
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson.id,
            slotId: 123,
            start: dayjs().toISOString(),
            duration: lesson.duration,
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with busy tutor in case the lesson cannot be booked at the specified time.", async () => {
      const tutor = await db.tutor();
      const student1 = await db.student();
      const student2 = await db.student();

      const date = dayjs.utc().startOf("hour");
      await db.lesson({
        tutor: tutor.id,
        student: student1.id,
        start: date.toISOString(),
        duration: ILesson.Duration.Long,
      });

      const { lesson: lesson2 } = await db.lesson({
        tutor: tutor.id,
        student: student2.id,
        start: date.add(1, "hour").toISOString(),
        duration: ILesson.Duration.Long,
      });

      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson2.id,
            // NOTE: conflicts with student1 lesson
            start: date.toISOString(),
            duration: lesson2.duration,
            slotId: lesson2.slotId,
          },
          user: student2,
        })
      );
      expect(res).to.deep.eq(busyTutor());
    });

    it("should successfully update lesson data.", async () => {
      const tutor = await db.tutor();
      const student = await db.student();

      const date = dayjs.utc().startOf("hour");
      const slot = await db.slot({
        userId: tutor.id,
        start: date.toISOString(),
        end: date.add(1, "day").toISOString(),
      });

      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        slot: slot.id,
        start: date.toISOString(),
        duration: ILesson.Duration.Long,
      });

      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson.id,
            start: date.add(1, "hour").toISOString(),
            duration: lesson.duration,
            slotId: lesson.slotId,
          },
          user: student,
        })
      );

      expect(res).to.not.be.instanceof(Error);
      const updated = await lessons.findById(lesson.id);
      expect(updated?.start).to.eq(date.add(1, "hour").toISOString());
    });
  });

  describe(nameof(cancelLesson), () => {
    it("should respond with not found status in case the lesson does not exist.", async () => {
      const student = await db.student();
      const res = await cancelLesson({
        user: student,
        params: { lessonId: 4321 },
      });
      expect(res).to.deep.eq(notfound.lesson());
    });

    it("should respond with forbidden status in case the requester is not one of the members.", async () => {
      const tutor = await db.tutor();
      const student = await db.student();

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        timing: "future",
        slot: slot.id,
      });

      const res = await cancelLesson({
        user: await db.student(),
        params: { lessonId: lesson.id },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the lesson has at maximum 6 hours to start", async () => {
      const tutor = await db.tutor();
      const student = await db.student();

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        start: dayjs()
          .add(UNCANCELLABLE_LESSON_HOURS - 1, "hours")
          .toISOString(),
        slot: slot.id,
      });

      const res = await cancelLesson({
        user: student,
        params: { lessonId: lesson.id },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with lessonTimePassed in case the lesson time has already passed", async () => {
      const tutor = await db.tutor();
      const student = await db.student();

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        timing: "past",
        slot: slot.id,
      });

      const res = await cancelLesson({
        user: student,
        params: { lessonId: lesson.id },
      });

      expect(res).to.deep.eq(lessonTimePassed());
    });

    it("should respond with 200 status code in case the lesson is cancelled and update the cache.", async () => {
      const tutor = await db.tutor();
      const student = await db.student();

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        timing: "future",
        slot: slot.id,
      });

      const res = await cancelLesson({
        user: student,
        params: { lessonId: lesson.id },
      });

      expect(res).to.be.not.instanceOf(Error);
    });
  });

  describe(nameof(findAttendedLessonsStats), () => {
    it("should respond with forbidden if the user is not an admin.", async () => {
      const tutorManager = await db.user({ role: IUser.Role.TutorManager });
      const start = dayjs().startOf("day");
      const res = await findAttendedLessonsStats({
        user: tutorManager,
        query: {
          after: start.toISOString(),
          before: start.add(1, "day").toISOString(),
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with bad if the user entered an invalid date range.", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const start = dayjs().startOf("day");
      const res = await findAttendedLessonsStats({
        user: admin,
        query: {
          after: start.add(1, "day").toISOString(),
          before: start.toISOString(),
        },
      });
      expect(res).to.deep.eq(bad());
    });

    it("should respond with attended-lessons-info correctly.", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      // insert mock data
      const start = dayjs().startOf("day");
      await Promise.all([
        db.lesson({
          start: start.toISOString(),
          duration: ILesson.Duration.Long,
          price: 100,
        }),
        db.lesson({
          start: start.add(1, "hour").toISOString(),
          duration: ILesson.Duration.Long,
          price: 0,
        }),
        db.lesson({
          start: start.add(1, "day").toISOString(),
          duration: ILesson.Duration.Long,
          price: 100,
        }),
        db.lesson({
          start: start.add(2, "day").toISOString(),
          duration: ILesson.Duration.Long,
          price: 100,
        }),
        db.lesson({
          start: start.add(3, "day").toISOString(),
          duration: ILesson.Duration.Long,
          price: 100,
        }),
      ]);

      const res1 = await findAttendedLessonsStats({
        user: admin,
        query: {
          after: start.toISOString(),
          before: start.add(1, "day").toISOString(),
        },
      });
      expect(res1).to.not.be.instanceof(Error);
      expect(res1.body).to.deep.eq([
        {
          date: start.format("YYYY-MM-DD"),
          paidLessonCount: 1,
          paidTutoringMinutes: 30,
          freeLessonCount: 1,
          freeTutoringMinutes: 30,
        },
      ]);

      const res2 = await findAttendedLessonsStats({
        user: admin,
        query: {
          after: start.toISOString(),
          before: start.add(4, "day").toISOString(),
        },
      });
      expect(res2).to.not.be.instanceof(Error);
      expect(res2.body).to.deep.members([
        {
          date: start.add(3, "day").format("YYYY-MM-DD"),
          paidLessonCount: 1,
          paidTutoringMinutes: 30,
          freeLessonCount: 0,
          freeTutoringMinutes: 0,
        },
        {
          date: start.add(2, "day").format("YYYY-MM-DD"),
          paidLessonCount: 1,
          paidTutoringMinutes: 30,
          freeLessonCount: 0,
          freeTutoringMinutes: 0,
        },
        {
          date: start.add(1, "day").format("YYYY-MM-DD"),
          paidLessonCount: 1,
          paidTutoringMinutes: 30,
          freeLessonCount: 0,
          freeTutoringMinutes: 0,
        },
        {
          date: start.format("YYYY-MM-DD"),
          paidLessonCount: 1,
          paidTutoringMinutes: 30,
          freeLessonCount: 1,
          freeTutoringMinutes: 30,
        },
      ]);
    });
  });
});
