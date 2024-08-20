// construct internal rep. of time ✅
// compare time ✅
// parse time ✅
// Add time.
// conversion
// formating
// setter

const DAY_HOUR_COUNT = 24;
const MIN_RAILWAY_HOUR = 0;
const MAX_RAILWAY_HOUR = 23;
const MIN_MIDDAY_HOUR = 1;
const MAX_MIDDAY_HOUR = 12;
const HOUR_MINUTE_COUNT = 60;

export enum Meridiem {
  AM = "am",
  PM = "pm",
}

export type PartsTuple = [horus: number, min: number];
export type RawMiddayParts = [time: string, meridiem: Meridiem];
export type RawMidday = `${string} ${Meridiem}`;
export type TimeParts = {
  /**
   * Day hours from 0 to 23
   */
  hours: number;
  /**
   * Minutes from 0 to 59
   */
  minutes: number;
};
export type RawTime =
  | string
  | PartsTuple
  | RawMiddayParts
  | Time
  | TimeParts
  | `${string} ${Meridiem}`;
export type Level = "h" | "m";
export type Format = "midday" | "railway";
export type Midday = { hours: number; minutes: number; meridiem: Meridiem };

export type FormatterMap = {
  midnight?: string; // 12am - 2pm
  morning?: string; // 3pm - 11am
  noon?: string; // 12pm - 2pm
  afternoon?: string; // 3pm - 5pm
  night?: string; // 6pm - 11pm
};

type DaySegment = {
  start: string;
  end: string;
  id: keyof FormatterMap;
  default: string;
};

const start: TimeParts = { hours: 0, minutes: 0 };
const segments: Array<DaySegment> = [
  { start: "12am", end: "2am", id: "midnight", default: "Midnight" },
  { start: "3am", end: "11am", id: "morning", default: "Morning" },
  { start: "12pm", end: "2pm", id: "noon", default: "Noon" },
  { start: "3pm", end: "5pm", id: "afternoon", default: "Afternoon" },
  { start: "6pm", end: "11pm", id: "night", default: "Night" },
];

const INVALID_CODE = -1;

function prefix(value: number): string {
  return value.toString().padStart(2, "0");
}

export class Time {
  private parts: TimeParts;

  constructor(value: RawTime) {
    this.parts = Time.parse(value);
  }

  public hours(): number {
    return this.parts.hours;
  }

  public minutes() {
    return this.parts.minutes;
  }

  public isSame(other: RawTime, level: Level = "m") {
    const time = Time.from(other);
    if (!this.isValid() || !time.isValid()) return false;

    const hours = this.hours() === time.hours();
    const minutes = this.minutes() === time.minutes();
    if (level === "m") return hours && minutes;
    return hours;
  }

  public isBefore(other: RawTime, level: Level = "m"): boolean {
    const time = Time.from(other);
    if (!this.isValid() || !time.isValid()) return false;

    const firstTimeHours = this.hours() * HOUR_MINUTE_COUNT;
    const secondTimeHours = time.hours() * HOUR_MINUTE_COUNT;

    if (level === "h") return firstTimeHours < secondTimeHours;
    return firstTimeHours + this.minutes() < secondTimeHours + time.minutes();
  }

  public isAfter(other: RawTime, level: Level = "m"): boolean {
    const target = Time.from(other);
    if (!this.isValid() || !target.isValid()) return false;

    const baseHours = this.hours() * HOUR_MINUTE_COUNT;
    const targetHours = target.hours() * HOUR_MINUTE_COUNT;

    if (level === "h") return baseHours > targetHours;
    return baseHours + this.minutes() > targetHours + target.minutes();
  }

  public isBetween(
    first: RawTime,
    second: RawTime,
    level: Level = "m"
  ): boolean {
    const t1 = Time.from(first);
    const t2 = Time.from(second);
    const same = this.isSame(t1, level) || this.isSame(t2, level);
    const between = this.isAfter(t1, level) && this.isBefore(t2, level);
    return same || between;
  }

  public asMiddayParts(): Midday {
    const [hours, meridiem] = Time.asMiddayHour(this.hours());
    return { hours, minutes: this.minutes(), meridiem };
  }

  public format(format: Format = "railway", map: FormatterMap = {}) {
    if (format === "railway")
      return [prefix(this.hours()), prefix(this.minutes())].join(":");

    const { hours, minutes, meridiem } = this.asMiddayParts();
    const time = [prefix(hours), prefix(minutes)].join(":");
    const segment = this.getDaySegment();
    console.log({ segment });
    if (!map || !segment) return [time, meridiem].join(" ");
    const label = map[segment.id] || segment.default;
    return [time, label].join(" ");
  }

  private getDaySegment(): DaySegment | null {
    for (const segment of segments) {
      if (this.isBetween(Time.from(segment.start), Time.from(segment.end), "h"))
        return segment;
    }

    return null;
  }

  private static asMiddayHour(
    hour: number
  ): [hour: number, meridiem: Meridiem] {
    if (hour === 0) return [12, Meridiem.PM];
    if (hour <= 12) return [hour, Meridiem.AM];
    return [hour - 12, Meridiem.PM];
  }

  public static from(value: RawTime): Time {
    return new Time(value);
  }

  public isValid() {
    return (
      this.parts.hours !== INVALID_CODE || this.parts.minutes !== INVALID_CODE
    );
  }

  private static parseTime(value: string, min: number, max: number): TimeParts {
    if (!value) return start;
    const [prefix, suffix] = value.split(":");
    return {
      hours: Time.parseHours(prefix, min, max),
      minutes: Time.parseMinutes(suffix),
    };
  }

  private static parseMinutes(value: string | undefined) {
    if (!value) return 0;
    const minutes = Number(value);
    if (Number.isNaN(minutes) || minutes >= HOUR_MINUTE_COUNT || minutes < 0)
      return INVALID_CODE;
    return minutes;
  }

  private static parseHours(
    value: string | undefined,
    min: number,
    max: number
  ) {
    if (!value) return 0;
    const hours = Number(value);
    if (Number.isNaN(hours) || !prefix || hours > max || hours < min)
      return INVALID_CODE;
    return hours;
  }

  private static parseRailway(value: string): TimeParts {
    return Time.parseTime(value, MIN_RAILWAY_HOUR, MAX_RAILWAY_HOUR);
  }

  private static parseMiddayParts(value: [time: string, meridiem: Meridiem]) {
    const [time, meridiem] = value;
    const { hours, minutes } = Time.parseTime(
      time,
      MIN_MIDDAY_HOUR,
      MAX_MIDDAY_HOUR
    );

    return {
      hours:
        hours === INVALID_CODE
          ? INVALID_CODE
          : Time.asRailwayHour(hours, meridiem),
      minutes,
    };
  }

  private static parseMiddayRaw(value: RawMidday): TimeParts {
    const meridiem = value.toLowerCase().includes(Meridiem.AM)
      ? Meridiem.AM
      : Meridiem.PM;

    const time = value.toLowerCase().replace(meridiem, "").trim();
    const { hours, minutes } = Time.parseTime(
      time,
      MIN_MIDDAY_HOUR,
      MAX_MIDDAY_HOUR
    );
    return {
      hours:
        hours === INVALID_CODE
          ? INVALID_CODE
          : Time.asRailwayHour(hours, meridiem),
      minutes,
    };
  }

  private static asRailwayHour(hour: number, meridiem: Meridiem): number {
    if (hour == 12 && meridiem === Meridiem.AM) return 0;
    if (hour >= 1 && hour <= 11 && meridiem === Meridiem.PM) return 12 + hour;
    return hour;
  }

  private static parseParts(
    value: [hours: number, minutes: number]
  ): TimeParts {
    const [hours, minutes] = value;
    return {
      hours: hours >= DAY_HOUR_COUNT || hours < 0 ? INVALID_CODE : hours,
      minutes:
        minutes >= HOUR_MINUTE_COUNT || minutes < 0 ? INVALID_CODE : minutes,
    };
  }

  private static isRaw(value: RawTime): value is string {
    return typeof value === "string";
  }

  private static isRawMidday(value: RawTime): value is RawMidday {
    // ref: https://regex101.com/r/DXjd9z/1
    const regex = /^-?\d+:?-?(\d+)?(\s*)(am|pm|AM|PM)$/;
    return typeof value === "string" && regex.test(value);
  }

  private static isTime(value: RawTime): value is Time {
    return value instanceof Time;
  }

  private static isParts(
    value: RawTime
  ): value is [horus: number, minutes: number] {
    return (
      Array.isArray(value) &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    );
  }

  private static isMiddayParts(value: RawTime): value is RawMiddayParts {
    return (
      Array.isArray(value) &&
      typeof value[0] === "string" &&
      typeof value[1] === "string"
    );
  }

  private static parse(value: RawTime): TimeParts {
    if (Time.isRawMidday(value)) return Time.parseMiddayRaw(value);
    if (Time.isRaw(value)) return Time.parseRailway(value);
    if (Time.isParts(value)) return Time.parseParts(value);
    if (Time.isMiddayParts(value)) return Time.parseMiddayParts(value);
    if (Time.isTime(value))
      return { hours: value.hours(), minutes: value.minutes() };
    return value;
  }
}
