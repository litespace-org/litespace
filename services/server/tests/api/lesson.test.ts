import { Api } from "@fixtures/api";
import dayjs from "@/lib/dayjs";
import { IRule } from "@litespace/types";
import { Time } from "@litespace/sol/time";
import { faker } from "@faker-js/faker/locale/ar";
import { unpackRules } from "@litespace/sol/rule";
import { expect } from "chai";

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
