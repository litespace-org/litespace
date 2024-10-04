import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

function asIsoDate(date: string | Dayjs): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export { dayjs, asIsoDate };
export type { Dayjs };
