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
  reachedBookingLimit,
  subscriptionRequired,
  noEnoughMinutes,
} from "@/lib/error";
import { dayjs, safe } from "@litespace/utils";
import { ILesson, IUser } from "@litespace/types";
import { lessons, subscriptions } from "@litespace/models";

const createLesson = mockApi<ILesson.CreateApiPayload>(
  handlers.create(mockApiContext())
);

const updateLesson = mockApi<ILesson.UpdateApiPayload>(
  handlers.update(mockApiContext())
);

describe("/api/v1/lesson/", () => {
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

  describe("POST /api/v1/lesson/", () => {
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
      const student = await db.student();

      const res = await createLesson({
        user: student,
        body: {
          tutorId: 3214,
          slotId: 4132,
          start: dayjs().toISOString(),
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(notfound.tutor());
    });

    it("should respond with slot notfound in case the slotId is not found", async () => {
      const student = await db.student();
      const tutor = await db.tutor();

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: 3214,
          start: dayjs().toISOString(),
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with bad in case the start date is before now", async () => {
      const student = await db.student();

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

    it("should respond with reachedBookingLimit in case an unsubscribed user books more than one lesson", async () => {
      const student = await db.student();
      const tutor = await db.tutor();

      await db.lesson({
        student: student.id,
        tutor: tutor.id,
      });

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

      expect(res).to.deep.eq(reachedBookingLimit());
    });

    it("should respond with busyTutor in case the tutor has already a lesson at the specified time", async () => {
      const student = await db.student();
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

      const student2 = await db.student();

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

    it("should respond with subscriptionRequired in case an unsubscribed student is booking with a regular tutor", async () => {
      const student = await db.student();

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

      expect(res).to.deep.eq(subscriptionRequired());
    });

    it("should respond with subscriptionRequired in case the subscription is no longer valid (ended)", async () => {
      const student = await db.student();
      await db.subscription({
        userId: student.id,
        start: dayjs().subtract(4, "week").toISOString(),
        end: dayjs().subtract(1, "minute").toISOString(),
      });

      const tutor = await db.tutor();
      const slot = await db.slot({ userId: tutor.id });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(subscriptionRequired());
    });

    it("should respond with subscriptionRequired in case the subscription is terminated", async () => {
      const student = await db.student();
      const sub = await db.subscription({ userId: student.id });
      await subscriptions.update(sub.id, {
        terminatedAt: dayjs().toISOString(),
      });

      const tutor = await db.tutor();
      const slot = await db.slot({ userId: tutor.id });

      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.deep.eq(subscriptionRequired());
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

    it("should respond with bad in case the lesson doesn't start within the current week", async () => {
      const student = await db.student();
      const start = dayjs().startOf("week");
      await db.subscription({
        userId: student.id,
        start: start.toISOString(),
        end: start.add(2, "week").toISOString(),
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

      expect(res).to.deep.eq(bad());
    });

    it("should successfully create the lesson when an unsubscribed student books a lesson with a tutor-manager", async () => {
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

    it("should successfully create lesson in case the sub user has no quota but subscribing with tutor-manager", async () => {
      const now = dayjs();
      const student = await db.student();

      const tutor = await db.tutor();
      await db.slot({
        userId: tutor.id,
        start: now.toISOString(),
        end: now.add(1, "week").toISOString(),
      });

      // create a one week subscription
      const sub = await db.subscription({
        userId: student.id,
        start: now.toISOString(),
        end: now.add(1, "week").toISOString(),
        weeklyMinutes: 300,
      });

      for (let i = 0; i < Math.floor(sub.weeklyMinutes / 30); i++) {
        await db.lesson({
          student: student.id,
          tutor: tutor.id,
          start: now.add(i * 30, "minute").toISOString(),
          duration: ILesson.Duration.Long,
        });
      }

      const tutorManager = await db.tutorManager();
      const slot = await db.slot({
        userId: tutorManager.id,
        start: now.toISOString(),
        end: now.add(1, "week").toISOString(),
      });

      const i = Math.ceil(sub.weeklyMinutes / 30);
      const res = await createLesson({
        user: student,
        body: {
          tutorId: tutorManager.id,
          slotId: slot.id,
          start: now.add(i * 30, "minute").toISOString(),
          duration: ILesson.Duration.Short,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.status).to.eq(200);
    });
  });

  describe("PATCH /api/v1/lesson/", () => {
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
});
