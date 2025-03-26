import { Api } from "@fixtures/api";
import dayjs from "@/lib/dayjs";
import { expect } from "chai";
import { cache } from "@/lib/cache";
import db from "@fixtures/db";
import { bad, reachedBookingLimit, forbidden, notfound } from "@/lib/error";
import { genSessionId, getSubSlots, safe } from "@litespace/utils";
import { first, last } from "lodash";
import { lessons, knex } from "@litespace/models";

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

  describe("GET /api/v1/lesson/list", () => {
    it("should filter lessons using the `after` and `before` flag", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const date = dayjs.utc().add(1, "hour").startOf("hour");
      const lessonsCount = 10;

      const slot = await db.slot({
        userId: tutor.user.id,
        start: date.toISOString(),
        end: date.add(lessonsCount / 2, "hour").toISOString(),
      });

      const subslots = getSubSlots(slot, 30);

      for (const subslot of subslots) {
        await db.lesson({
          start: subslot.start,
          slot: slot.id,
          duration: 30,
          tutor: tutor.user.id,
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
        const found = await tutorApi.api.lesson.findLessons({
          users: [tutor.user.id],
          after: test.after,
          before: test.before,
        });
        expect(found.total).to.be.eq(test.total);
      }
    });
  });

  describe("POST /api/v1/lesson", () => {
    it("should respond with bad request when students try to book a lesson in the past", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.findCurrentUser();

      const date = dayjs.utc().subtract(1, "day").startOf("day");
      const slot = await db.slot({
        userId: tutor.user.id,
        start: date.toISOString(),
        end: date.add(1, "day").toISOString(),
      });

      const res = await safe(async () => {
        return await studentApi.api.lesson.create({
          slotId: slot.id,
          tutorId: tutor.user.id,
          start: date.add(3, "hour").toISOString(),
          duration: 30,
        });
      });

      expect(res).to.deep.eq(bad());
    });

    it("should respond with conflict when students try to book a lesson while another is booked in future date", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.findCurrentUser();

      const date = dayjs.utc().add(1, "day").startOf("day");
      const slot = await db.slot({
        userId: tutor.user.id,
        start: date.toISOString(),
        end: date.add(1, "day").toISOString(),
      });

      // future lesson
      await safe(async () => {
        return await studentApi.api.lesson.create({
          slotId: slot.id,
          tutorId: tutor.user.id,
          start: date.add(18, "hour").toISOString(),
          duration: 30,
        });
      });

      const res = await safe(async () => {
        return await studentApi.api.lesson.create({
          slotId: slot.id,
          tutorId: tutor.user.id,
          start: date.add(3, "hour").toISOString(),
          duration: 30,
        });
      });

      expect(res).to.deep.eq(reachedBookingLimit());
    });

    it("should respond with conflict when students try to book a lesson while another should be going on now", async () => {
      const tutorApi = await Api.forTutor();
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.findCurrentUser();
      const student = await studentApi.findCurrentUser();

      const date = dayjs.utc().add(1, "day").startOf("day");
      const slot = await db.slot({
        userId: tutor.user.id,
        start: date.toISOString(),
        end: date.add(1, "day").toISOString(),
      });

      // going on lesson
      const created = await safe(async () => {
        return await knex.transaction(async (tx) => {
          return await lessons.create({
            slot: slot.id,
            tutor: tutor.user.id,
            student: student.user.id,
            session: genSessionId("lesson"),
            start: dayjs.utc().subtract(15, "minute").toISOString(),
            duration: 30,
            price: 123,
            tx,
          });
        });
      });

      expect(created).to.not.be.instanceOf(Error);

      const res = await safe(async () => {
        return await studentApi.api.lesson.create({
          slotId: slot.id,
          tutorId: tutor.user.id,
          start: date.add(3, "hour").toISOString(),
          duration: 30,
        });
      });

      expect(res).to.deep.eq(reachedBookingLimit());
    });

    it("should respond with conflict when students try to book more than one lesson in general (with different tutors)", async () => {
      const studentApi = await Api.forStudent();

      const tutor1 = await db.tutor();
      const tutor2 = await db.tutor();

      const date = dayjs.utc().add(1, "day").startOf("day");
      const slot = await db.slot({
        userId: tutor1.id,
        start: date.toISOString(),
        end: date.add(1, "day").toISOString(),
      });

      // future lesson
      await safe(async () => {
        return await studentApi.api.lesson.create({
          slotId: slot.id,
          tutorId: tutor1.id,
          start: date.add(18, "hour").toISOString(),
          duration: 30,
        });
      });

      const res = await safe(async () => {
        return await studentApi.api.lesson.create({
          slotId: slot.id,
          tutorId: tutor2.id,
          start: date.add(3, "hour").toISOString(),
          duration: 30,
        });
      });

      expect(res).to.deep.eq(reachedBookingLimit());
    });
  });

  describe("DELETE /api/v1/lesson/:lessonId", () => {
    it("should respond with not found status in case the lesson does not exist.", async () => {
      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.api.lesson.cancel(123));
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

      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        timing: "future",
        slot: slot.id,
      });

      const studentApi = await Api.forStudent();
      const res = await safe(async () =>
        studentApi.api.lesson.cancel(lesson.lesson.id)
      );

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with 200 status code in case the lesson is cancelled and update the cache.", async () => {
      const studentApi = await Api.forStudent();
      const tutor = await db.tutor();
      const student = await studentApi.findCurrentUser();

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.user.id,
        timing: "future",
        slot: slot.id,
      });

      const res = await safe(async () =>
        studentApi.api.lesson.cancel(lesson.lesson.id)
      );

      expect(res).to.be.not.instanceOf(Error);
    });
  });
});
