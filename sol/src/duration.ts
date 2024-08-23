const HOUR_MINUTE_COUNT = 60;

type RawDuration = string;

type Unit = { value: number; label: string | undefined };

const labels = {
  hour: ["hours", "hour", "hrs", "hr", "h", "ساعات", "ساعة", "س"],
  minutes: ["minutes", "minute", "mins", "min", "m", "دقائق", "دقيقة", "د"],
};

type UnitMap = {
  hour?: string;
  pairHours?: string;
  hours?: string;
  minute?: string;
  pairMinutes?: string;
  mintues?: string;
  seperator?: string;
};

type UnitMapShort = {
  hour?: string;
  minute?: string;
};

const defaultUnitMap: UnitMap = {
  hour: "Hour",
  pairHours: "2 Hours",
  hours: "Hours",
  minute: "Minute",
  pairMinutes: "2 Minutes",
  mintues: "Minutes",
  seperator: "and",
} as const;

const defaultShortUnitMap: UnitMapShort = {
  hour: "h",
  minute: "m",
} as const;

export class Duration {
  units: Unit[];

  constructor(value: RawDuration) {
    this.units = Duration.parse(value);
  }

  minutes() {
    const minutes = this.units.reduce((prev: number, curr: Unit) => {
      if (!curr.label || labels.minutes.includes(curr.label))
        return prev + curr.value;
      return prev + curr.value * HOUR_MINUTE_COUNT;
    }, 0);
    return Math.round(minutes);
  }

  parts() {
    const totalMinutes = this.minutes();
    const hours = Math.floor(totalMinutes / HOUR_MINUTE_COUNT);
    const minutes = Math.floor(totalMinutes - hours * HOUR_MINUTE_COUNT);
    return { hours, minutes };
  }

  format(unitMap: UnitMap = defaultUnitMap): string {
    const parts = this.parts();
    const hours = this.formatHours(parts.hours, unitMap);
    const minutes = this.formatMinutes(parts.minutes, unitMap);

    const seperator =
      hours && minutes && unitMap.seperator ? unitMap.seperator : "";

    return [hours, seperator, minutes].join(" ").trim();
  }

  formatShort(map: UnitMapShort = defaultShortUnitMap) {
    const { hours, minutes } = this.parts();
    return [
      this.formatHoursShort(hours, map),
      this.formatMinutesShort(minutes, map),
    ]
      .join(" ")
      .trim();
  }

  formatHoursShort(hours: number, map: UnitMapShort) {
    if (hours === 0) return "";
    return [hours, map.hour].join("");
  }

  formatMinutesShort(minutes: number, map: UnitMapShort) {
    if (minutes === 0) return "";
    return [minutes, map.minute].join("");
  }

  private formatHours(hours: number, map: UnitMap) {
    if (hours === 0) return "";
    if (hours === 1) return map.hour;
    if (hours === 2) return map.pairHours;
    return [hours, map.hours].join(" ");
  }

  private formatMinutes(minutes: number, map: UnitMap) {
    if (minutes === 0) return "";
    if (minutes === 1) return map.minute;
    if (minutes === 2) return map.pairMinutes;
    return [minutes, map.mintues].join(" ");
  }

  private static parse(raw: RawDuration) {
    const duration = /( *)(\d*\.?\d*)( *)(hrs|hr|h|س|mins|min|m|د)?( *)/g;
    const units: Unit[] = [];
    while (true) {
      const match = duration.exec(raw);
      if (!match) break;
      const full = match[0];
      if (!full || units.length > 2) break;
      const rawValue = match[2].trim();
      const unit = match[4];
      const onlyUnit = !rawValue && unit;
      const value = onlyUnit ? 1 : Number(rawValue);
      units.push({ value, label: unit });
    }

    return units;
  }

  public static from(value: RawDuration) {
    return new Duration(value);
  }
}
