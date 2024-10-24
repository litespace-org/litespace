import humanizeDuration from "humanize-duration";

const HOUR_MINUTE_COUNT = 60;
const MINUTE_TO_MS = 60000;

export type RawDuration = string;

const labels = {
  hour: ["hours", "hour", "hrs", "hr", "h", "ساعات", "ساعة", "س"],
  minutes: ["minutes", "minute", "mins", "min", "m", "دقائق", "دقيقة", "د"],
};

export class Duration {
  durationInMS: number;

  constructor(value: RawDuration) {
    this.durationInMS = Duration.parse(value);
  }

  minutes() {
    return Math.floor(this.durationInMS / MINUTE_TO_MS);
  }

  hours() {
    return humanizeDuration(this.durationInMS, {
      units: ["h"],
      round: true,
    });
  }

  format(locale: string): string {
    return humanizeDuration(this.durationInMS, {
      units: ["h", "m"],
      language: locale,
      digitReplacements:
        locale === "ar"
          ? ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
          : undefined,
    });
  }

  private static parse(raw: RawDuration) {
    const duration = /( *)(\d*\.?\d*)( *)(hrs|hr|h|س|mins|min|m|د)?( *)/g;
    let durationInMins = 0;

    while (true) {
      const match = duration.exec(raw);
      if (!match) break;

      const full = match[0];
      if (!full) break;

      const rawValue = match[2].trim();
      const unit = match[4];
      const onlyUnit = !rawValue && unit;
      const value = onlyUnit ? 1 : Number(rawValue);
      if (!unit || labels.minutes.includes(unit)) {
        durationInMins += value;
      } else {
        durationInMins += value * HOUR_MINUTE_COUNT;
      }
    }

    return durationInMins * MINUTE_TO_MS;
  }

  public static from(value: RawDuration) {
    return new Duration(value);
  }
}
