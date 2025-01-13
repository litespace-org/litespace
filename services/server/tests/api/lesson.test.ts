import { Api } from "@fixtures/api";
import dayjs from "@/lib/dayjs";
import { IRule } from "@litespace/types";
import { Time } from "@litespace/sol/time";
import { faker } from "@faker-js/faker/locale/ar";
import { unpackRules } from "@litespace/sol/rule";
import { expect } from "chai";
import { cache } from "@/lib/cache";
import db from "@fixtures/db";
import { forbidden, notfound } from "@/lib/error";
import { safe } from "@litespace/sol";

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

      const rule = await tutorApi.atlas.rule.create({
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "day").startOf("day").toISOString(),
        duration: 8 * 60,
        frequency: IRule.Frequency.Daily,
        time: Time.from("12:00").utc().format("railway"),
        title: faker.lorem.words(3),
      });

      const slot = await db.slot({
        userId: tutor.user.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "day").startOf("day").toISOString(),
      });

      const unpackedRules = unpackRules({
        rules: [rule],
        slots: [],
        start: rule.start,
        end: rule.end,
      });

      // create 10 future lessons
      for (const rule of unpackedRules) {
        await studentApi.atlas.lesson.create({
          start: rule.start,
          ruleId: rule.id,
          slotId: slot.id,
          duration: 30,
          tutorId: tutor.user.id,
        });
      }

      const tests = [
        {
          after: unpackedRules[0].start,
          before: unpackedRules[9].end,
          total: 10,
        },
        {
          after: unpackedRules[0].start,
          before: unpackedRules[0].end,
          total: 1,
        },
        // skip first lesson
        {
          after: dayjs.utc(unpackedRules[0].start).add(1, "hour").toISOString(),
          before: unpackedRules[9].end,
          total: 9,
        },
        // skip last lesson
        {
          after: unpackedRules[0].start,
          before: dayjs
            .utc(unpackedRules[9].start)
            .subtract(1, "hour")
            .toISOString(),
          total: 9,
        },
      ];

      for (const test of tests) {
        expect(
          await studentApi.atlas.lesson
            .findLessons({
              users: [student.user.id],
              after: test.after,
              before: test.before,
            })
            .then((lessons) => {
              return lessons.total;
            })
        ).to.be.eq(test.total);
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

      const rule = await db.activatedRule({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        timing: "future",
        rule: rule.id,
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

      const rule = await db.activatedRule({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const slot = await db.slot({
        userId: tutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.user.id,
        timing: "future",
        rule: rule.id,
        slot: slot.id,
      });

      const res = await safe(async () =>
        studentApi.atlas.lesson.cancel(lesson.lesson.id)
      );

      expect(res).to.be.not.instanceOf(Error);
    });
  });
});
