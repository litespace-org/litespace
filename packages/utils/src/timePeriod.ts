import { IUser } from "@litespace/types";
import { dayjs } from "@/dayjs";
import { TIME_PERIODS } from "@/constants";

export function getEligibleTimePeriods(
  startTime: string,
  endTime: string
): IUser.TimePeriod[] {
  const start = dayjs(startTime, "HH:mm");
  const end = dayjs(endTime, "HH:mm");

  const result: IUser.TimePeriod[] = [];

  for (const [key, { start: pStart, end: pEnd }] of Object.entries(
    TIME_PERIODS
  )) {
    const periodStart = dayjs(pStart, "HH:mm");
    const periodEnd = dayjs(pEnd, "HH:mm");

    const overlaps =
      (start.isBefore(periodEnd) && end.isAfter(periodStart)) ||
      // handle wrap-around (like Night: 00:00–05:59)
      (periodEnd.isBefore(periodStart) &&
        (start.isAfter(periodStart) || end.isBefore(periodEnd)));

    if (overlaps) result.push(key as unknown as IUser.TimePeriod);
  }

  return result;
}
