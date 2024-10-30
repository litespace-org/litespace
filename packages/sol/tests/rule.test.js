import { dayjs } from "@/dayjs";
import { Time } from "@/time";
import { Schedule } from "@/rule";
import { expect } from "chai";
import { IDate, IRule } from "@litespace/types";
describe("Schedule", () => {
    it("should unpack rules", () => {
        const rule = {
            frequency: IRule.Frequency.Daily,
            start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
            end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
            time: Time.from("12pm"),
            duration: 60,
        };
        const mask = Schedule.event("2024-08-11 12:00", "2024-08-11 12:30");
        const recurrence = new Schedule(rule).between(dayjs.utc("2024-08-11").toDate(), dayjs.utc("2024-08-13").toDate(), // non includsive
        [mask]);
        expect(recurrence).to.be.deep.eq([
            { start: "2024-08-11T12:30:00.000Z", end: "2024-08-11T13:00:00.000Z" },
            { start: "2024-08-12T12:00:00.000Z", end: "2024-08-12T13:00:00.000Z" },
        ]);
    });
    it("should unpack single rule with single event", () => {
        const rule = {
            frequency: IRule.Frequency.Daily,
            start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
            end: dayjs.utc("2024-08-02").startOf("day").toISOString(),
            time: Time.from("12pm"),
            duration: 60,
        };
        const recurrence = new Schedule(rule).between(dayjs.utc("2024-08-01").toDate(), dayjs.utc("2024-08-02").toDate() // non includsive
        );
        expect(recurrence).to.be.deep.eq([
            { start: "2024-08-01T12:00:00.000Z", end: "2024-08-01T13:00:00.000Z" },
        ]);
    });
    describe("Rule intersection", () => {
        it("should handle intersecting daily rules", () => {
            const rule = {
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("12pm"),
                duration: 60, // ends at 1pm
            };
            expect(Schedule.from(rule).intersecting(rule)).to.be.true;
            expect(Schedule.from(rule).intersecting({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("1pm"), // start at a different time
                duration: 60,
            })).to.be.false;
            expect(Schedule.from(rule).intersecting({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-010").startOf("day").toISOString(), // ends before the base rule
                time: Time.from("12pm"),
                duration: 60,
            })).to.be.false;
            expect(Schedule.from(rule).intersecting({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-11").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("12pm"),
                duration: 10,
            })).to.be.true;
        });
        it("should handle rules with weekdays", () => {
            const rule = {
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("12pm"),
                duration: 60, // ends at 1pm
                weekday: [IDate.Weekday.Monday],
            };
            expect(Schedule.from({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60, // ends at 1pm
                weekday: [],
            }).intersecting({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("2pm"),
                duration: 60, // ends at 1pm
                weekday: [],
            })).to.be.false;
            expect(Schedule.from({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-07-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60, // ends at 1pm
                weekday: [],
            }).intersecting({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("2pm"),
                duration: 60, // ends at 1pm
                weekday: [],
            })).to.be.false;
            expect(Schedule.from({
                frequency: IRule.Frequency.Monthly,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [IDate.Weekday.Saturday, IDate.Weekday.Sunday],
            }).intersecting({
                frequency: IRule.Frequency.Weekly,
                start: dayjs.utc("2024-07-15").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-15").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [IDate.Weekday.Monday, IDate.Weekday.Tuesday],
            })).to.be.false;
            expect(Schedule.from({
                frequency: IRule.Frequency.Monthly,
                start: dayjs.utc("2024-08-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [],
            }).intersecting({
                frequency: IRule.Frequency.Weekly,
                start: dayjs.utc("2024-07-15").startOf("day").toISOString(),
                end: dayjs.utc("2024-08-15").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [IDate.Weekday.Monday, IDate.Weekday.Tuesday],
            })).to.be.true;
            expect(Schedule.from({
                frequency: IRule.Frequency.Monthly,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [],
            }).intersecting({
                frequency: IRule.Frequency.Weekly,
                start: dayjs.utc("2024-08-15").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-15").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [IDate.Weekday.Monday, IDate.Weekday.Tuesday],
            })).to.be.true;
        });
    });
    describe("Format rules", () => {
        it("should format daily/monthly/weekly with weekday and month day", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [IDate.Weekday.Monday, IDate.Weekday.Tuesday],
                monthday: 10,
            });
            expect(s.format()).to.be.eq(`on Monday or Thuesday from 04:00 am until 05:00 am the 10 of the month starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format daily/monthly/weekly with weekday and month day", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Monthly,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 60,
                weekday: [IDate.Weekday.Monday, IDate.Weekday.Tuesday],
                monthday: 10,
            });
            expect(s.format()).to.be.eq(`on Monday or Thuesday from 04:00 am until 05:00 am the 10 of the month starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format daily/monthly/weekly with weekday and month day", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Weekly,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 120,
                weekday: [IDate.Weekday.Thursday, IDate.Weekday.Friday],
                monthday: 10,
            });
            expect(s.format()).to.be.eq(`on Thursday or Friday from 04:00 am until 06:00 am the 10 of the month starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format daily/monthly/weekly month day only", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 120,
                monthday: 4,
            });
            expect(s.format()).to.be.eq(`day 4 of the month from 04:00 am until 06:00 am starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format daily/monthly/weekly weekday day only", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 120,
                weekday: [IDate.Weekday.Thursday, IDate.Weekday.Friday],
            });
            expect(s.format()).to.be.eq(`on Thursday or Friday from 04:00 am until 06:00 am starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format daily only", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Daily,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 120,
            });
            expect(s.format()).to.be.eq(`Every day from 04:00 am until 06:00 am starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format weekly only", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Weekly,
                start: dayjs.utc("2024-09-01").startOf("day").toISOString(),
                end: dayjs.utc("2024-09-30").startOf("day").toISOString(),
                time: Time.from("1am"),
                duration: 120,
            });
            expect(s.format()).to.be.eq(`Every week on Sunday from 04:00 am until 06:00 am starting from 01 September, 2024 until 30 September, 2024.`);
        });
        it("should format monthly only", () => {
            const s = Schedule.from({
                frequency: IRule.Frequency.Monthly,
                start: dayjs.utc("2024-08-03").toISOString(),
                end: dayjs.utc("2025-12-01").toISOString(),
                time: Time.from("1am"),
                duration: 20,
            });
            expect(s.format()).to.be.eq(`the 3 of the month from 04:00 am until 04:20 am starting from 03 August, 2024 until 01 December, 2025.`);
        });
    });
});
//# sourceMappingURL=rule.test.js.map