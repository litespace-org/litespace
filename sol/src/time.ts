// construct internal rep of time
// compare time
// parse time
// Add time.

const DAY_HOUR_COUNT = 24;
const MIDDAY_HOUR_COUNT = 12;
const MIN_RAILWAY_HOUR = 0;
const MAX_RAILWAY_HOUR = 23;
const MIN_MIDDAY_HOUR = 1;
const MAX_MIDDAY_HOUR = 12;
const HOUR_MINUTE_COUNT = 60;

export enum Meridiem {
  AM = "am",
  PM = "pm",
}

type RawTime =
  | string // raw
  | [horus: number, mintues: number] // parts
  | [time: string, meridiem: Meridiem] // midday
  | Time;

type TimeParts = {
  /**
   * Day hours from 0 to 23
   */
  hours: number;
  /**
   * Mintues from 0 to 59
   */
  minutes: number;
};

type Level = "h" | "m";

const start: TimeParts = { hours: 0, minutes: 0 };

const INVALID_CODE = -1;

export class Time {
  private parts: TimeParts;

  constructor(value: RawTime) {
    this.parts = Time.parse(value);
  }

  public hours(): number {
    return this.parts.hours;
  }

  public mintues() {
    return this.parts.minutes;
  }

  public isSame(other: RawTime, level: Level = "m") {
    const time = Time.from(other);
    if (!this.isValid() || !time.isValid()) return false;

    const hours = this.hours() === time.hours();
    const mintues = this.mintues() === time.mintues();
    if (level === "m") return hours && mintues;
    return hours;
  }

  public isBefore(other: RawTime, level: Level = "m"): boolean {
    const time = Time.from(other);
    if (!this.isValid() || !time.isValid()) return false;

    const firstTimeHours =
      Time.asComperableHour(this.hours()) * HOUR_MINUTE_COUNT;
    const secondTimeHours =
      Time.asComperableHour(time.hours()) * HOUR_MINUTE_COUNT;

    if (level === "h") return firstTimeHours < secondTimeHours;
    return firstTimeHours + this.mintues() < secondTimeHours + time.mintues();
  }

  public isAfter(other: RawTime, level: Level = "m"): boolean {
    const time = Time.from(other);
    if (!this.isValid() || !time.isValid()) return false;

    const firstTimeHours =
      Time.asComperableHour(this.hours()) * HOUR_MINUTE_COUNT;
    const secondTimeHours =
      Time.asComperableHour(time.hours()) * HOUR_MINUTE_COUNT;

    if (level === "h") return firstTimeHours > secondTimeHours;
    return firstTimeHours + this.mintues() > secondTimeHours + time.mintues();
  }

  public static from(value: RawTime): Time {
    return new Time(value);
  }

  public isValid() {
    return (
      this.parts.hours !== INVALID_CODE || this.parts.minutes !== INVALID_CODE
    );
  }

  private static asComperableHour(hour: number): number {
    if (hour === MIN_RAILWAY_HOUR) return DAY_HOUR_COUNT;
    return hour;
  }

  private static parseTime(value: string, max: number, min: number): TimeParts {
    if (!value) return start;
    const [prefix, suffix] = value.split(":");
    const hours = Number(prefix);
    const minutes = Number(suffix);
    return {
      hours:
        Number.isNaN(hours) || !prefix || hours > max || hours < min
          ? INVALID_CODE
          : hours,
      minutes:
        Number.isNaN(minutes) ||
        !suffix ||
        minutes >= HOUR_MINUTE_COUNT ||
        minutes < 0
          ? INVALID_CODE
          : minutes,
    };
  }

  private static parseRailway(value: string): TimeParts {
    return Time.parseTime(value, MAX_RAILWAY_HOUR, MIN_RAILWAY_HOUR);
  }

  private static parseMidday(value: [time: string, meridiem: Meridiem]) {
    const [time, meridiem] = value;
    const { hours, minutes } = Time.parseTime(
      time,
      MAX_MIDDAY_HOUR,
      MIN_MIDDAY_HOUR
    );

    return {
      hours:
        hours === INVALID_CODE
          ? INVALID_CODE
          : Time.asRailwayHour(hours, meridiem === Meridiem.PM),
      minutes,
    };
  }

  private static asRailwayHour(hour: number, pm: boolean): number {
    if (hour == 12 && pm) return 0;
    if (pm) return 12 + hour;
    return hour;
  }

  private static parseParts(
    value: [hours: number, mintues: number]
  ): TimeParts {
    const [hours, mintues] = value;
    return {
      hours: hours >= DAY_HOUR_COUNT || hours < 0 ? INVALID_CODE : hours,
      minutes:
        mintues >= HOUR_MINUTE_COUNT || mintues < 0 ? INVALID_CODE : mintues,
    };
  }

  private static isRaw(value: RawTime): value is string {
    return typeof value === "string";
  }

  private static isTime(value: RawTime): value is Time {
    return value instanceof Time;
  }

  private static isParts(
    value: RawTime
  ): value is [horus: number, mintues: number] {
    return (
      Array.isArray(value) &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    );
  }

  private static parse(value: RawTime): TimeParts {
    if (Time.isRaw(value)) return Time.parseRailway(value);
    if (Time.isParts(value)) return Time.parseParts(value);
    if (Time.isTime(value))
      return { hours: value.hours(), minutes: value.mintues() };
    return Time.parseMidday(value);
  }
}
