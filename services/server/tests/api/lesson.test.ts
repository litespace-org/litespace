import { Api } from "@fixtures/api";
import dayjs from "@/lib/dayjs";
import { expect } from "chai";
import { cache } from "@/lib/cache";
import db from "@fixtures/db";
import { forbidden, notfound } from "@/lib/error";
import { getSubSlots, safe } from "@litespace/utils";

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
      const studentApi = await Api.forStudent();

      const tutor = await tutorApi.findCurrentUser();
      const student = await studentApi.findCurrentUser();

      const date = dayjs.utc();
      const slot = await db.slot({
        userId: tutor.user.id,
        start: date.startOf("hour").toISOString(),
        end: date.add(5, "hour").toISOString(),
      });

      const subslots = getSubSlots(slot, 30);

      // create 10 future lessons
      for (const subslot of subslots) {
        await studentApi.atlas.lesson.create({
          start: subslot.start,
          slotId: slot.id,
          duration: 30,
          tutorId: tutor.user.id,
        });
      }

      const tests = [
        {
          after: subslots[0].start,
          before: subslots[9].end,
          total: 10,
        },
        {
          after: subslots[0].start,
          before: subslots[0].end,
          total: 1,
        },
        // skip first two lessons
        {
          after: subslots[2].start,
          before: subslots[9].end,
          total: 8,
        },
        // skip last two lessons
        {
          after: subslots[0].start,
          before: subslots[8].start,
          total: 8,
        },
      ];

      for (const test of tests) {
        const found = await studentApi.atlas.lesson.findLessons({
          users: [student.user.id],
          after: test.after,
          before: test.before,
        });
        expect(found.total).to.be.eq(test.total);
      }
    });
  });

  describe("DELETE /api/v1/lesson/:lessonId", () => {
    it("should respond with not found status in case the lesson does not exist.", async () => {
      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.atlas.lesson.cancel(123));
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
        studentApi.atlas.lesson.cancel(lesson.lesson.id)
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
        studentApi.atlas.lesson.cancel(lesson.lesson.id)
      );

      expect(res).to.be.not.instanceOf(Error);
    });
  });
});
