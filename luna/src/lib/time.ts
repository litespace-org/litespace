/**
 * "Dayjs" index days from Sunday (0) to Saturday (6)
 *
 * In arabic, we index days from Saturday (0) to Friday (6)
 *
 * @param day Number from 0 (Sunday) to 6 (Saturday)
 * @returns Number from 0 (Saturday) to 6 (Friday)
 */
export function asArabicDayIndex(day: number) {
  return day < 6 ? day + 1 : 0;
}

/**
 * Convert 1-12 + am/pm hour into 0-23-hour system (railway)
 */
export function asRailwayHour(hour: number, pm: boolean) {
  if (hour == 12 && pm) return 0;
  if (pm) return 12 + hour;
  return hour;
}

/**
 * Convert 0-23 hour into 0-12/am+pm system (midday)
 */
export function asMiddayHour(hour: number): [number, "pm" | "am"] {
  if (hour === 0) return [12, "pm"];
  if (hour <= 12) return [hour, "am"];
  return [hour - 12, "pm"];
}
