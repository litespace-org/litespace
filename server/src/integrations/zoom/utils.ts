import dayjs from "@/lib/dayjs";

/**
 *
 * @param start the start time in utc timezone
 */
export function asZoomStartTime(start: string) {
  return dayjs(start).tz("Africa/Cairo").format("YYYY-MM-DDTHH:mm:ss");
}
