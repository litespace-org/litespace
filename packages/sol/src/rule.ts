import { RRule, Frequency, datetime } from "rrule";
import { dayjs } from "@/dayjs";
import { FormatterMap, RawTime, Time } from "@/time";
import { orderBy, isEmpty, minBy, maxBy } from "lodash";
import { Dayjs } from "dayjs";
import { IDate, IInterview, ILesson, IRule } from "@litespace/types";
import { INTERVIEW_DURATION } from "@/constants";

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
 * 5. `WEEKLY` with none: event will happen at the start (sunday) of every week.
 * 6. `MONTHLY` with none: event will happen each month at the same `Rule.start`
 *    day.
 * 7. Single event has a date range of one day (e.g., start = 2024-08-01 & end = 2024-08-02)
 *
 */
export type Rule = {
  frequency: IRule.Frequency;
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
  weekday?: IDate.Weekday[];
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

export type RuleFormatterMap = {
  days: Record<IDate.Weekday, string>;
  frequency: Record<IRule.Frequency, string>;
  time?: FormatterMap | null;
  labels: {
    monthday: { prefix: string; suffix: string };
    start: string;
    until: string;
    from: string;
    onDay: string;
    day: string;
    weekdaySeperator: string;
  };
};

type Rulish = Rule | Schedule;
type Datish = string | Date | Dayjs;

export const weekdayMap = {
  [IDate.Weekday.Sunday]: RRule.SU,
  [IDate.Weekday.Monday]: RRule.MO,
  [IDate.Weekday.Tuesday]: RRule.TU,
  [IDate.Weekday.Wednesday]: RRule.WE,
  [IDate.Weekday.Thursday]: RRule.TH,
  [IDate.Weekday.Friday]: RRule.FR,
  [IDate.Weekday.Saturday]: RRule.SA,
};

export const defaultRuleFormatterMap: RuleFormatterMap = {
  days: {
    [IDate.Weekday.Sunday]: "Sunday",
    [IDate.Weekday.Monday]: "Monday",
    [IDate.Weekday.Tuesday]: "Thuesday",
    [IDate.Weekday.Wednesday]: "Wednesday",
    [IDate.Weekday.Thursday]: "Thursday",
    [IDate.Weekday.Friday]: "Friday",
    [IDate.Weekday.Saturday]: "Saturday",
  },
  frequency: {
    [IRule.Frequency.Daily]: "Every day",
    [IRule.Frequency.Weekly]: "Every week",
    [IRule.Frequency.Monthly]: "Every month",
  },
  labels: {
    monthday: { prefix: "the", suffix: "of the month" },
    start: "starting from",
    until: "until",
    from: "from",
    onDay: "on",
    day: "day",
    weekdaySeperator: "or",
  },
};

export const frequencyMap = {
  [IRule.Frequency.Daily]: Frequency.DAILY,
  [IRule.Frequency.Weekly]: Frequency.WEEKLY,
  [IRule.Frequency.Monthly]: Frequency.MONTHLY,
};

export class Schedule {
  private readonly rule: Rule;
  private readonly rrule: RRule;
  private dayjs: typeof dayjs = dayjs;

  constructor(rule: Rulish) {
    this.rule = rule instanceof Schedule ? rule.rule : rule;
    this.rrule = Schedule.asRRule(this.rule);
  }

  public withDayjs(day: typeof dayjs): Schedule {
    this.dayjs = day;
    return this;
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

  public intersecting(rule: Rulish) {
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
      this.rule.frequency === IRule.Frequency.Daily &&
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

  public format(map: RuleFormatterMap = defaultRuleFormatterMap) {
    const freq = this.formatFreq(map.frequency);
    const dates =
      this.formatDates({
        start: map.labels.start,
        until: map.labels.until,
      }) + ".";
    const time = this.formatTime(map.labels.until, map.labels.from, map.time);

    if (!isEmpty(this.rule.weekday) && this.rule.monthday) {
      return [
        this.formatWeekdays(
          map.days,
          map.labels.onDay,
          map.labels.weekdaySeperator
        ),
        time,
        this.formatMonthday(this.rule.monthday, map.labels.monthday),
        dates,
      ].join(" ");
    }

    if (this.rule.monthday)
      return [
        map.labels.day,
        this.rule.monthday,
        map.labels.monthday.suffix,
        time,
        dates,
      ].join(" ");

    if (!isEmpty(this.rule.weekday))
      return [
        this.formatWeekdays(
          map.days,
          map.labels.onDay,
          map.labels.weekdaySeperator
        ),
        time,
        dates,
      ].join(" ");

    if (this.rule.frequency === IRule.Frequency.Daily)
      return [freq, time, dates].join(" ");

    if (this.rule.frequency === IRule.Frequency.Weekly)
      return [
        freq,
        map.labels.onDay,
        map.days[IDate.Weekday.Sunday],
        time,
        dates,
      ].join(" ");

    if (this.rule.frequency === IRule.Frequency.Monthly)
      return [
        this.formatMonthday(dayjs(this.rule.start).date(), map.labels.monthday),
        time,
        dates,
      ].join(" ");
  }

  private formatWeekdays(
    days: RuleFormatterMap["days"],
    on: string,
    seperator: string
  ): string {
    const weekdays = this.rule.weekday;
    if (!weekdays || isEmpty(weekdays)) return "";
    if (weekdays.length == 1) return days[weekdays[0]];
    return [on, weekdays.map((day) => days[day]).join(` ${seperator} `)].join(
      " "
    );
  }

  private formatFreq(freq: RuleFormatterMap["frequency"]): string {
    return freq[this.rule.frequency];
  }

  private formatDates(labels: { start: string; until: string }): string {
    return [
      labels.start,
      this.dayjs(this.rule.start).format("DD MMMM, YYYY"),
      labels.until,
      this.dayjs(this.rule.end).format("DD MMMM, YYYY"),
    ].join(" ");
  }

  private formatTime(
    until: string,
    from: string,
    map?: FormatterMap | null
  ): string {
    const start = Time.from(this.rule.time);
    return [
      from,
      start.local().format("midday", map),
      until,
      start.local().addMinutes(this.rule.duration).format("midday", map),
    ].join(" ");
  }

  private formatMonthday(
    monthday: number,
    labels: RuleFormatterMap["labels"]["monthday"]
  ): string {
    return [labels.prefix, monthday, labels.suffix].join(" ");
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

  public static order<T extends Event>(
    events: T[],
    order: "asc" | "desc"
  ): T[] {
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
      freq: frequencyMap[rule.frequency],
      dtstart: dayjs.utc(rule.start).toDate(),
      until: dayjs.utc(rule.end).toDate(),
      byweekday: rule.weekday?.map((weekday) => weekdayMap[weekday]),
      byhour: time.hours(),
      byminute: time.minutes(),
      bymonthday: rule.monthday,
    });
  }
}

export function asRule<T extends IRule.CreateApiPayload | IRule.Self>(
  rule: T
): Rule {
  return {
    frequency: rule.frequency,
    start: rule.start,
    end: rule.end,
    time: rule.time,
    duration: rule.duration,
    weekday: rule.weekdays,
    monthday: rule.monthday || undefined,
  };
}

export function unpackRules({
  rules,
  slots,
  start,
  end,
}: {
  rules: IRule.Self[];
  slots: IRule.Slot[];
  start: string;
  end: string;
}) {
  const output: IRule.RuleEvent[] = [];

  for (const rule of rules) {
    const ruleSlots = slots
      .filter((slot) => slot.ruleId === rule.id)
      .map((slot) => {
        const start = dayjs.utc(slot.start);
        const end = start.add(slot.duration, "minutes");
        return Schedule.event(start, end);
      });

    const ruleEvents: IRule.RuleEvent[] = Schedule.from(asRule(rule))
      .between(start, end, ruleSlots)
      .map((event) => ({ id: rule.id, ...event }));

    output.push(...ruleEvents);
  }

  return output;
}

export function splitRuleEvent<T extends Event>(
  rule: T,
  duration: number
): T[] {
  const list: T[] = [];
  let start = dayjs.utc(rule.start);

  while (true) {
    const end = start.add(duration, "minutes");
    if (end.isAfter(rule.end)) break;
    list.push({ ...rule, start: start.toISOString(), end: end.toISOString() });
    start = end;
  }

  return list;
}

export function toUtcDate(value: string | Dayjs) {
  const date = dayjs.utc(value);
  return datetime(
    date.year(),
    date.month() + 1,
    date.date(),
    date.hour(),
    date.minute(),
    date.second()
  );
}

export function asSlot<T extends ILesson.Self | IInterview.Self>(
  item: T
): IRule.Slot {
  return {
    ruleId: "ids" in item ? item.ids.rule : item.ruleId,
    start: item.start,
    duration: "duration" in item ? item.duration : INTERVIEW_DURATION,
  };
}

export function asSlots<T extends ILesson.Self | IInterview.Self>(
  items: T[]
): IRule.Slot[] {
  return items.map((item) => asSlot(item));
}
