import { datetime, Frequency, RRule, RRuleSet, rrulestr, Weekday } from "rrule";
import { dayjs } from "@/dayjs";
import { Time } from "@/time";
import { Schedule, Rule, Event, toUtcDate } from "@/rule";
import { expect } from "chai";

describe("Schedule", () => {
  it.only("should unpack rules", () => {
    const rule: Rule = {
      frequency: Frequency.DAILY,
      start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
      end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
      time: Time.from("12pm"),
      duration: 60,
    };

    const mask: Event = Schedule.event("2024-08-11 12:00", "2024-08-11 12:30");

    const recurrence = new Schedule(rule).between(
      dayjs.utc("2024-08-11").toDate(),
      dayjs.utc("2024-08-13").toDate(), // non includsive
      [mask]
    );

    expect(recurrence).to.be.deep.eq([
      { start: "2024-08-11T12:30:00.000Z", end: "2024-08-11T13:00:00.000Z" },
      { start: "2024-08-12T12:00:00.000Z", end: "2024-08-12T13:00:00.000Z" },
    ]);
  });

  it("should unpack single rule with single event", () => {
    const rule: Rule = {
      frequency: Frequency.DAILY,
      start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
      end: dayjs.utc("2024-08-02").startOf("day").toISOString(),
      time: Time.from("12pm"),
      duration: 60,
    };

    const recurrence = new Schedule(rule).between(
      dayjs.utc("2024-08-01").toDate(),
      dayjs.utc("2024-08-02").toDate() // non includsive
    );

    expect(recurrence).to.be.deep.eq([
      { start: "2024-08-01T12:00:00.000Z", end: "2024-08-01T13:00:00.000Z" },
    ]);
  });

  describe("Rule intersection", () => {
    it("should handle intersecting daily rules", () => {
      const rule: Rule = {
        frequency: Frequency.DAILY,
        start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
        end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
        time: Time.from("12pm"),
        duration: 60, // ends at 1pm
      };

      expect(Schedule.from(rule).intersecting(rule)).to.be.true;
      expect(
        Schedule.from(rule).intersecting({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("1pm"), // start at a different time
          duration: 60,
        })
      ).to.be.false;
      expect(
        Schedule.from(rule).intersecting({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-010").startOf("day").toISOString(), // ends before the base rule
          time: Time.from("12pm"),
          duration: 60,
        })
      ).to.be.false;
      expect(
        Schedule.from(rule).intersecting({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-08-11").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("12pm"),
          duration: 10,
        })
      ).to.be.true;
    });

    it("should handle rules with weekdays", () => {
      const rule: Rule = {
        frequency: Frequency.DAILY,
        start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
        end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
        time: Time.from("12pm"),
        duration: 60, // ends at 1pm
        weekday: [RRule.MO],
      };

      expect(
        Schedule.from({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [],
        }).intersecting({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("2pm"),
          duration: 60, // ends at 1pm
          weekday: [],
        })
      ).to.be.false;

      expect(
        Schedule.from({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-07-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [],
        }).intersecting({
          frequency: Frequency.DAILY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("2pm"),
          duration: 60, // ends at 1pm
          weekday: [],
        })
      ).to.be.false;

      expect(
        Schedule.from({
          frequency: Frequency.MONTHLY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [RRule.SA, RRule.SU],
        }).intersecting({
          frequency: Frequency.WEEKLY,
          start: dayjs.utc("2024-07-15").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-15").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [RRule.MO, RRule.TU],
        })
      ).to.be.false;

      expect(
        Schedule.from({
          frequency: Frequency.MONTHLY,
          start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [],
        }).intersecting({
          frequency: Frequency.WEEKLY,
          start: dayjs.utc("2024-07-15").startOf("day").toISOString(),
          end: dayjs.utc("2024-08-15").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [RRule.MO, RRule.TU],
        })
      ).to.be.true;

      expect(
        Schedule.from({
          frequency: Frequency.MONTHLY,
          start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
          end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [],
        }).intersecting({
          frequency: Frequency.WEEKLY,
          start: dayjs.utc("2024-08-15").startOf("day").toISOString(),
          end: dayjs.utc("2024-09-15").startOf("day").toISOString(),
          time: Time.from("1am"),
          duration: 60, // ends at 1pm
          weekday: [RRule.MO, RRule.TU],
        })
      ).to.be.true;

      // expect(
      //   Schedule.from({
      //     frequency: Frequency.DAILY,
      //     start: dayjs.utc("2024-08-11").startOf("day").toISOString(),
      //     time: Time.from("1am"),
      //     duration: 60, // ends at 1pm
      //     weekday: [RRule.SA, RRule.SU],
      //   }).intersecting({
      //     frequency: Frequency.DAILY,
      //     start: dayjs.utc("2024-08-11").startOf("day").toISOString(),
      //     time: Time.from("1am"),
      //     duration: 60, // ends at 1pm
      //     weekday: [],
      //   })
      // ).to.be.true;
    });
  });
});
