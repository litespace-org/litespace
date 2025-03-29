import { concat, flattenDeep, isEmpty, orderBy, uniqBy } from "lodash";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";

type Video = {
  id: number;
  start: Dayjs;
  /**
   * Video duration in milliseconds.
   */
  duration: number;
};

export type VideoSlice = {
  start: Dayjs;
  end: Dayjs;
};

export type Layout = {
  type:
    | "full-screen"
    | "split-screen"
    | "solo-presenter"
    | "accompanied-presenter"
    | "multi-peresenter";
};

export function findBreakTimestamps(target: Video, others: Video[]): Dayjs[] {
  const timestamps = flattenDeep(
    others.map((other) => {
      return [other.start, other.start.add(other.duration)];
    })
  );

  const start = target.start;
  const end = start.add(target.duration);
  return uniqBy(
    timestamps.filter((timestamp) =>
      timestamp.isBetween(start, end, "milliseconds", "()")
    ),
    (timestamp) => timestamp.valueOf()
  );
}

export function asSlices(video: Video, timestamps: Dayjs[]) {
  const start = video.start;
  const end = start.add(video.duration);
  const ordered = orderBy(
    concat(start, end, timestamps),
    (timestamp) => timestamp.valueOf(),
    "asc"
  );

  const slices: VideoSlice[] = [];
  let prev: Dayjs = start;

  for (const timestamp of ordered) {
    if (!timestamp.isAfter(prev)) continue;
    slices.push({ start: prev, end: timestamp });
    prev = timestamp;
  }

  return orderBy(slices, (slice) => slice.start.valueOf(), "asc");
}

export function compose(videos: Video[]) {
  if (isEmpty(videos)) return [];
}
