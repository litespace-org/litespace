import {
  datetime,
  RRule,
  Frequency,
  RRuleSet,
  rrulestr,
  ByWeekday,
  Weekday,
} from "rrule";
import { dayjs } from "@/dayjs";
import { RawTime, Time } from "@/time";
import { orderBy, isEmpty, isEqual, intersection, minBy, maxBy } from "lodash";
import { Dayjs } from "dayjs";

/**
 * ### Notes
 * 1. Any frequency with `monthday` and
 *    `weekday`: event will happen at any day that match the week and day of the
 *    month.
 * 2. Any frequency with `monthday` only :
 *    event will happen on month days that match `monthday`.
 * 2. Any frequency with `weekday` only: will happen at these days of every week.
 * 3. `DAILY` with `weekday` only : event will happen on week days that match
 *    `weekday`.
 * 4. `DAILY` with none: event will happen everyday.
 * 5. `WEEKLY` with none: event will happen at the start of every week.
 * 6. `MONTHLY` with none: event will happen each month at the same `Rule.start`
 *    day.
 */
export type Rule = {
  frequency: Frequency;
  /**
   * UTC based start time
   */
  start: string;
  /**
   * UTC based end time
   */
  end: string;
  time: RawTime;
  /**
   *  Rule duration in minutes
   */
  duration: number;
  weekday?: Weekday[];
  monthday?: number;
};

export type Event = {
  /**
   * UTC based start time
   */
  start: string;
  /**
   * UTC based end time
   */
  end: string;
};

type Rulish = Rule | Schedule;
type Datish = string | Date | Dayjs;

function asRule(rule: Rule): RRule {
  const time = Time.from(rule.time);
  return new RRule({
    freq: rule.frequency,
    dtstart: dayjs.utc(rule.start).toDate(),
    until: rule.end ? dayjs.utc(rule.end).toDate() : null,
    byweekday: rule.weekday,
    byhour: time.hours(),
    byminute: time.minutes(),
  });
}

export class Schedule {
  private readonly rule: Rule;
  private readonly rrule: RRule;

  constructor(rule: Rulish) {
    this.rule = rule instanceof Schedule ? rule.rule : rule;
    this.rrule = Schedule.asRRule(this.rule);
  }

  public static from(rule: Rule | Schedule): Schedule {
    return new Schedule(rule);
  }

  public between(start: Datish, end: Datish, exclude: Event[] = []): Event[] {
    const occurrences = this.rrule.between(
      dayjs.utc(start).toDate(),
      dayjs.utc(end).toDate()
    );
    const events = Schedule.withDuration(occurrences, this.rule.duration);
    return Schedule.mask(events, exclude);
  }

  public intersecting(rule: Rulish, window = 1) {
    const target = Schedule.from(rule);

    const dateOverlap = this.isDateOverlapping(
      target.rule.start,
      target.rule.end
    );

    if (!dateOverlap) return false;

    if (this.isDailyOnly() && target.isDailyOnly() && dateOverlap)
      return this.isTimeOverlapping(target.rule.time, target.rule.duration);

    const { start, end } = Schedule.getIntersectingBounds(
      { start: this.rule.start, end: this.rule.end },
      { start: target.rule.start, end: target.rule.end }
    );
    const first = this.between(start, end);
    const second = target.between(start, end);

    for (const i of first) {
      for (const j of second) {
        if (Schedule.isEventOverlapping(i, j)) return true;
      }
    }

    return false;
  }

  private static getIntersectingBounds(first: Event, second: Event): Event {
    const start = maxBy([first.start, second.start], (date) =>
      dayjs.utc(date).unix()
    );

    const end = minBy([first.end, second.end], (date) =>
      dayjs.utc(date).unix()
    );

    if (!end || !start) throw new Error("Unable to determine date overlap");

    return Schedule.event(start, end);
  }

  private isIntersectingDateTime(rule: Rulish): boolean {
    const target = rule instanceof Schedule ? rule.rule : rule;
    return (
      this.isDateOverlapping(target.start, target.end) &&
      this.isTimeOverlapping(target.time, target.duration)
    );
  }

  public isWeekdayOverlapping(weekday: Rule["weekday"]) {
    const noweekday = isEmpty(weekday) || isEmpty(this.rule.weekday);
    const shared =
      weekday &&
      this.rule.weekday &&
      intersection(
        this.rule.weekday.map((day) => day.toString()),
        weekday.map((day) => day.toString())
      );

    return noweekday || !isEmpty(shared);
  }

  public isSameWeekdayFreq(freq: Rule["frequency"]): boolean {
    return this.rule.frequency === freq;
  }

  public isTimeOverlapping(time: RawTime, duration: number): boolean {
    const base = Time.from(this.rule.time);
    const target = Time.from(time);

    const xs = base;
    const xe = base.addMinutes(this.rule.duration);
    const ys = target;
    const ye = target.addMinutes(duration);

    // overlapping rule: x_start < y_end && y_start < x_end
    // ref: https://stackoverflow.com/a/3269471
    return xs.isBefore(ye) && ys.isBefore(xe);
  }

  public isDateOverlapping(start: Datish, end: Datish) {
    return Schedule.isEventOverlapping(
      Schedule.event(this.rule.start, this.rule.end),
      Schedule.event(start, end)
    );
  }

  public isDailyOnly() {
    return (
      this.rule.frequency === Frequency.DAILY &&
      isEmpty(this.rule.weekday) &&
      this.rule.monthday === undefined
    );
  }

  private static isEventOverlapping(first: Event, second: Event): boolean {
    const xs = dayjs.utc(first.start);
    const xe = dayjs.utc(first.end);
    const ys = dayjs.utc(second.start);
    const ye = dayjs.utc(second.end);
    return xs.isBefore(ye) && ys.isBefore(xe);
  }

  public text(): string {
    return this.rrule.toText();
  }

  public static mask(events: Event[], masks: Event[]) {
    const output: Event[] = [];
    for (const event of events) {
      const contained = Schedule.findContained(event, masks);
      output.push(...Schedule.splitBy(event, contained));
    }

    return output;
  }

  public static withDuration(dates: Date[], duration: number): Event[] {
    return dates.map((date) => ({
      start: date.toISOString(),
      end: dayjs.utc(date).add(duration, "minutes").toISOString(),
    }));
  }

  public static splitBy(base: Event, masks: Event[]): Event[] {
    const events: Event[] = [];
    let prev: Event = base;

    for (const mask of Schedule.order(masks, "asc")) {
      const start = dayjs.utc(prev.start);
      const end = dayjs.utc(mask.start);

      const empty = start.isSame(end);
      if (!empty) events.push(Schedule.event(start, end));
      prev = Schedule.event(mask.end, prev.end);
    }

    const empty = dayjs.utc(prev.start).isSame(prev.end);
    if (!empty) events.push(prev);

    return events;
  }

  public static order(events: Event[], order: "asc" | "desc"): Event[] {
    return orderBy(events, (event) => dayjs.utc(event.start).unix(), order);
  }

  public static event(
    start: string | Date | Dayjs,
    end: string | Date | Dayjs
  ): Event {
    return {
      start: dayjs.utc(start).toISOString(),
      end: dayjs.utc(end).toISOString(),
    };
  }

  /**
   *  Check if `second` is happening within `first`
   */
  public static isContained(first: Event, second: Event): boolean {
    const isBetween = (date: string) =>
      dayjs.utc(date).isBetween(first.start, first.end, "minutes", "[]");

    return isBetween(second.start) && isBetween(second.end);
  }

  public static findContained(base: Event, events: Event[]): Event[] {
    return events.filter((event) => Schedule.isContained(base, event));
  }

  public static asRRule(rule: Rule): RRule {
    const time = Time.from(rule.time);
    return new RRule({
      freq: rule.frequency,
      dtstart: dayjs.utc(rule.start).toDate(),
      until: dayjs.utc(rule.end).toDate(),
      byweekday: rule.weekday,
      byhour: time.hours(),
      byminute: time.minutes(),
      bymonthday: rule.monthday,
    });
  }
}

export function applyDuration(dates: Date[], duration: number) {
  return dates.map((date) => [
    date.toISOString(),
    dayjs.utc(date).add(duration, "minutes").toDate().toISOString(),
  ]);
}
