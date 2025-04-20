import dayjs from "@/lib/dayjs";

const now = dayjs().utc();

export function min(minutes: number) {
  return now.add(minutes, "minutes");
}

/**
 * Add `minutes` to the current time and convert it to iso date string.
 */
export function iso(minutes: number) {
  return min(minutes).toISOString();
}

export default {
  min,
  iso,
  now,
};
