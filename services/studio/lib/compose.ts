import {
  concat,
  entries,
  flattenDeep,
  groupBy,
  minBy,
  orderBy,
  uniqBy,
} from "lodash";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";

export type Video = {
  id: number;
  start: Dayjs;
  /**
   * Video duration in milliseconds.
   */
  duration: number;
  userId: number;
  src: string;
  screen?: boolean;
};

export type VideoSlice = {
  videoId: number;
  start: Dayjs;
  end: Dayjs;
};

export type VideoSliceGroup = {
  start: Dayjs;
  end: Dayjs;
  videoIds: number[];
};

export type Layout = {
  type:
    | "single-user" // one user
    | "dual-user" // two users
    | "presenter-screen" // one user and one screen
    | "co-presenter-screen" //  two users and one screen
    | "unkown";
  start: number;
  /**
   * Layout rendering duration in frames
   */
  duration: number;
  videos: Array<
    Video & {
      frames: { start: number; end: number };
    }
  >;
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
    slices.push({ videoId: video.id, start: prev, end: timestamp });
    prev = timestamp;
  }

  return orderBy(slices, (slice) => slice.start.valueOf(), "asc");
}

export function groupSlices(slices: VideoSlice[]): VideoSliceGroup[] {
  const map = groupBy(
    slices,
    (slice) => `${slice.start.valueOf()}:${slice.end.valueOf()}`
  );

  const groups = entries(map).map(([key, value]) => {
    const [start, end] = key.split(":");
    return {
      start: dayjs(Number(start)),
      end: dayjs(Number(end)),
      videoIds: value.map((slice) => slice.videoId),
    };
  });

  return orderBy(groups, (group) => group.start.valueOf(), "asc");
}

export function getGroupLayoutType(videos: Video[]): Layout["type"] {
  const users = videos.filter((video) => !video.screen);
  const screens = videos.filter((video) => video.screen);
  const userCount = users.length;
  const screenCount = screens.length;

  /**
   * Unsupported Layouts:
   * 1. More than one screen.
   * 2. More than two users
   */
  if (screenCount > 1 || userCount > 2) return "unkown";
  // with screen
  if (screenCount === 1 && userCount === 2) return "co-presenter-screen";
  if (screenCount === 1 && userCount === 1) return "presenter-screen";
  // without screen
  if (screenCount === 0 && userCount === 2) return "dual-user";
  if (screenCount === 0 && userCount === 1) return "single-user";

  return "unkown";
}

export function getVideoGroupLayout({
  groupVideos,
  group,
  absoluteStart,
  fps,
}: {
  group: VideoSliceGroup;
  groupVideos: Video[];
  absoluteStart: Dayjs;
  fps: number;
}): Layout {
  const type = getGroupLayoutType(groupVideos);
  const groupStartFrame =
    (group.start.diff(absoluteStart, "milliseconds") / 1000) * fps;
  const gruopDurationInFrames =
    (group.end.diff(group.start, "milliseconds") / 1000) * fps;
  const groupDuration = group.end.diff(group.start, "milliseconds");

  const videos: Layout["videos"] = [];

  for (const videoId of group.videoIds) {
    const video = groupVideos.find((video) => video.id === videoId);
    if (!video) continue;

    const videoStartFrame =
      (group.start.diff(video.start, "milliseconds") / 1000) * fps;

    const videoEndFrame = videoStartFrame + (groupDuration / 1000) * fps;

    videos.push({
      id: video.id,
      src: video.src,
      screen: video.screen,
      duration: video.duration,
      start: video.start,
      userId: video.userId,
      frames: {
        start: videoStartFrame,
        end: videoEndFrame,
      },
    });
  }

  return {
    type,
    start: groupStartFrame,
    duration: gruopDurationInFrames,
    videos: videos,
  };
}

export function compose(videos: Video[], fps: number): Layout[] {
  const groups = groupSlices(
    flattenDeep(
      videos.map((video) => {
        const others = videos.filter((v) => v.id !== video.id);
        const timestamps = findBreakTimestamps(video, others);
        return asSlices(video, timestamps);
      })
    )
  );

  const start = minBy(groups, (group) => group.start.valueOf())?.start;
  if (!start) return [];

  return groups.map((group) =>
    getVideoGroupLayout({
      groupVideos: videos.filter((video) => group.videoIds.includes(video.id)),
      absoluteStart: start,
      group,
      fps,
    })
  );
}
