import { datetime, RRule, RRuleSet, rrulestr } from "rrule";
import { dayjs } from "@/dayjs";
import { Time } from "@/time";
import { applyDuration } from "@/recurrence";

describe("Recurrence", () => {
  it("should work", () => {
    const rule = new RRule({
      freq: RRule.DAILY,
      dtstart: dayjs("2024-08-01").toDate(),
      until: dayjs("2024-09-1").toDate(), // last day is not included
      byhour: 10,
      byminute: 30,
    });

    const dates = rule.between(
      dayjs("2024-07-30").toDate(),
      dayjs("2024-09-05").toDate()
    );
    console.log("rule", rule.toText(), dates, applyDuration(dates, 30));

    // const lesson = new RRule({
    //   freq: RRule.DAILY,
    //   dtstart: dayjs("2024-08-03T10:30:00.000Z").toDate(),
    //   until: dayjs("2024-08-03T11:00:00.000Z").toDate(), // last day is not included
    // });

    // console.log("lesson", lesson.toText());

    // const set = new RRuleSet();

    // set.rrule(rule);
    // set.exrule(lesson);

    // console.log(
    //   "set",
    //   set.between(dayjs("2024-07-30").toDate(), dayjs("2024-09-05").toDate()),
    //   set.toText()
    // );
  });
});
