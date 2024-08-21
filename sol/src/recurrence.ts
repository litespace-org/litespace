import { datetime, RRule, RRuleSet, rrulestr } from "rrule";
import { dayjs } from "@/dayjs";

export function applyDuration(dates: Date[], duration: number) {
  return dates.map((date) => [
    date,
    dayjs.utc(date).add(duration, "minutes").toDate(),
  ]);
}
