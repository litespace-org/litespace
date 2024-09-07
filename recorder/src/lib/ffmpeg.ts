import ffmpeg from "fluent-ffmpeg";
import { number, omitByIdex } from "@/lib/utils";
import {
  entries,
  first,
  flattenDeep,
  isEmpty,
  last,
  orderBy,
  uniq,
} from "lodash";
import { FilterChain } from "./filter";
import { mediaConfig } from "@/config";

export type Artifact = {
  id: number;
  start: number;
  duration: number;
  screen?: boolean;
};

export type ArtifactSlice = { start: number; end: number };

export type ArtifactSliceGroup = ArtifactSlice & { ids: number[] };

export function findBreakPoints(base: Artifact, others: Artifact[]): number[] {
  const points = flattenDeep(
    others.map((other) => [other.start, other.start + other.duration])
  );

  const start = base.start;
  const end = start + base.duration;
  return uniq(points.filter((point) => point > start && point < end));
}

export function asArtifactSlices(
  artifact: Artifact,
  breakpoints: number[]
): ArtifactSlice[] {
  const slices: ArtifactSlice[] = [];
  const start = artifact.start;
  const end = start + artifact.duration;
  const ordered = orderBy(breakpoints);
  if (isEmpty(ordered)) return [{ start, end }];

  slices.push({ start: artifact.start, end: first(ordered)! });
  ordered.forEach((breakpiont: number, idx: number) => {
    const next = ordered[idx + 1];
    if (!next) return;
    return slices.push({ start: breakpiont, end: next });
  });
  slices.push({ start: last(ordered)!, end });

  return orderBy(slices, "start", "asc");
}

export function groupArtifacts(
  artifacts: Array<{
    id: Artifact["id"];
    slices: ArtifactSlice[];
  }>
): ArtifactSliceGroup[] {
  const map: Record<string, number[]> = {};
  for (const artifact of artifacts) {
    for (const slice of artifact.slices) {
      if (slice.start === slice.end) continue;
      const key = `${slice.start}:${slice.end}`;
      if (map[key]) map[key].push(artifact.id);
      else map[key] = [artifact.id];
    }
  }

  return entries(map).map(([key, value]) => {
    const [start, end] = key.split(":");
    return {
      start: number(start),
      end: number(end),
      ids: value,
    };
  });
}

function calculateRelativeTime(base: number, artifact: ArtifactSlice) {
  const start = artifact.start - base;
  const duration = artifact.end - artifact.start;
  return { start, end: start + duration };
}

type OverlayedVideoFilters = {
  cut: FilterChain;
  scale: FilterChain;
  overlay: FilterChain;
};

type OverlayVideoParams = {
  start: { full: number; artifact: number };
  ids: { artifact: number; background: string };
  dims: { width: number; height: number };
  slice: ArtifactSlice;
  pos?: { x?: number; y?: number };
};

/**
 * Overlay video on top of another video
 *
 * @param ids.artifact the artifact id (the same as its index in ffmpeg inputs
 * list)
 * @param ids.background the background video id (will be used as input in the
 * overlay filter).
 * @param slice the target artifact slice
 * @param start.full the start timestamp for the target full video.
 * @param start.artifact that timestamp that the artifact was recorded at.
 */
function overlayVideo({
  ids,
  slice,
  start,
  dims,
  pos = {},
}: OverlayVideoParams): OverlayedVideoFilters {
  const playTime = calculateRelativeTime(start.full, slice);
  const trimTime = calculateRelativeTime(start.artifact, slice);
  const tirmOutput = `trim-${ids.artifact}`;
  const scaleOutput = `scale-${ids.artifact}`;
  const overlayOutput = `overlay-${ids.artifact}`;

  const first = FilterChain.init()
    .trim(trimTime.start, trimTime.end)
    .withInput(ids.artifact)
    .withOutput(tirmOutput);

  const second = FilterChain.init()
    .vdelay(playTime.start)
    .scale({ w: dims.width, h: dims.height })
    .withInput(tirmOutput)
    .withOutput(scaleOutput);

  const overlay = FilterChain.init()
    .withInput([ids.background, scaleOutput])
    .overlay()
    .withOutput(overlayOutput);

  if (pos.x) overlay.overlayx(pos.x);
  if (pos.y) overlay.overlayy(pos.y);

  return { cut: first, scale: second, overlay };
}

export function asFullScreenView({
  ids,
  slice,
  start,
}: {
  ids: OverlayVideoParams["ids"];
  slice: OverlayVideoParams["slice"];
  start: OverlayVideoParams["start"];
}) {
  return overlayVideo({
    ids,
    slice,
    start,
    dims: mediaConfig.recordingDim, // full screen
  });
}

export function asSplitScreenView({
  start,
  slice,
  ids,
}: {
  start: { full: number; artifacts: { left: number; right: number } };
  slice: ArtifactSlice;
  ids: { artifacts: { left: number; right: number }; background: string };
}): {
  left: OverlayedVideoFilters;
  right: OverlayedVideoFilters;
} {
  const { width, height } = mediaConfig.recordingDim;

  const left = overlayVideo({
    start: { artifact: start.artifacts.left, full: start.full },
    ids: { artifact: ids.artifacts.left, background: ids.background },
    dims: { width: width / 2, height },
    slice,
  });

  const right = overlayVideo({
    start: { artifact: start.artifacts.right, full: start.full },
    ids: { artifact: ids.artifacts.right, background: left.overlay.outputs[0] },
    dims: { width: width / 2, height },
    pos: { x: width / 2 },
    slice,
  });

  return { left, right };
}

export function asSoloPersenterView({
  slice,
  ids,
  start,
}: {
  slice: ArtifactSlice;
  ids: { screen: number; presenter: number; background: string };
  start: { full: number; presenter: number; screen: number };
}) {
  const screen = asFullScreenView({
    slice,
    start: { full: start.full, artifact: start.screen },
    ids: { artifact: ids.screen, background: ids.background },
  });

  const { width, height } = mediaConfig.recordingDim;
  const w = Math.floor(width / 5);
  const h = Math.floor(height / 5);
  const x = width - w - 10;
  const y = height - h - 10;

  const presenter = overlayVideo({
    ids: { artifact: ids.presenter, background: screen.overlay.outputs[0] },
    start: { artifact: start.presenter, full: start.full },
    dims: { width: w, height: h },
    pos: { x, y },
    slice,
  });

  return { screen, presenter };
}

/**
 * Two users and one screen
 */
export function asAccompaniedPersenterView({
  ids,
  start,
  slice,
}: {
  ids: {
    background: string;
    screen: number;
    users: [number, number];
  };
  start: {
    full: number;
    screen: number;
    users: [number, number];
  };
  slice: ArtifactSlice;
}): {
  screen: OverlayedVideoFilters;
  users: { first: OverlayedVideoFilters; second: OverlayedVideoFilters };
  output: string;
} {
  const { width, height } = mediaConfig.recordingDim;
  // --------------------------
  // |              |   1st   |
  // |   screen     |   user  |
  // |     75%      |   2nd   |
  // |              |   user  |
  // --------------------------
  const sw = width * 0.75; // screen width (75%)
  const uw = width * 0.25; // user width (25%)
  const uh = height * 0.5; // user hight (50%)
  const ux = sw; // postion of the first user in the view  (aligned to the right after)
  const fuy = 0; // first user "y" (on the top)
  const suy = uh; // second user "y" (on the bottom)

  const screen = overlayVideo({
    ids: { artifact: ids.screen, background: ids.background },
    start: { artifact: start.screen, full: start.full },
    dims: { width: sw, height },
    slice,
  });

  const firstUser = overlayVideo({
    ids: { artifact: ids.users[0], background: screen.overlay.outputs[0] },
    start: { artifact: start.users[0], full: start.full },
    dims: { width: uw, height: uh },
    slice,
    pos: { x: ux, y: fuy },
  });

  const secondUser = overlayVideo({
    ids: { artifact: ids.users[1], background: firstUser.overlay.outputs[0] },
    start: { artifact: start.users[1], full: start.full },
    dims: { width: uw, height: uh },
    pos: { x: ux, y: suy },
    slice,
  });

  return {
    screen,
    users: { first: firstUser, second: secondUser },
    output: secondUser.overlay.outputs[0],
  };
}

/**
 * Two users and two screens
 */
export function asMultiPersenterView({
  ids,
  start,
  slice,
}: {
  ids: {
    background: string;
    screens: [number, number];
    users: [number, number];
  };
  start: {
    full: number;
    screens: [number, number];
    users: [number, number];
  };
  slice: ArtifactSlice;
}): {
  screens: { first: OverlayedVideoFilters; second: OverlayedVideoFilters };
  users: { first: OverlayedVideoFilters; second: OverlayedVideoFilters };
  output: string;
} {
  const { width, height } = mediaConfig.recordingDim;
  // --------------------------
  // |    1st     |    2nd    |
  // |   screen   |   screen  |
  // --------------------------
  // |    1st     |    2nd    |
  // |    user    |    user   |
  // ---------------------------
  const sw = width * 0.5; // screen width (50%)
  const sh = height * 0.5; // screen height (50%)
  const fsx = 0; // first screen "x" (top)
  const fsy = 0; // second screen "y" (left)
  const ssx = sw; // second screen "x" (top)
  const ssy = 0; // second screen "y" (right)
  const uw = width * 0.5; // user width (50%)
  const uh = height * 0.5; // user hight (50%)
  const fux = 0; // first user "x" (left)
  const fuy = uh; // first user "y" (bottom)
  const sux = uw; // first user "x" (right)
  const suy = uh; // second user "y" (bottom)

  const firstScreen = overlayVideo({
    ids: { artifact: ids.screens[0], background: ids.background },
    start: { artifact: start.screens[0], full: start.full },
    dims: { width: sw, height: sh },
    pos: { x: fsx, y: fsy },
    slice,
  });

  const secondScreen = overlayVideo({
    ids: {
      artifact: ids.screens[1],
      background: firstScreen.overlay.outputs[0],
    },
    start: { artifact: start.screens[1], full: start.full },
    dims: { width: sw, height: sh },
    pos: { x: ssx, y: ssy },
    slice,
  });

  const firstUser = overlayVideo({
    ids: {
      artifact: ids.users[0],
      background: secondScreen.overlay.outputs[0],
    },
    start: { artifact: start.users[0], full: start.full },
    dims: { width: uw, height: uh },
    slice,
    pos: { x: fux, y: fuy },
  });

  const secondUser = overlayVideo({
    ids: { artifact: ids.users[1], background: firstUser.overlay.outputs[0] },
    start: { artifact: start.users[1], full: start.full },
    dims: { width: uw, height: uh },
    pos: { x: sux, y: suy },
    slice,
  });

  return {
    screens: { first: firstScreen, second: secondScreen },
    users: { first: firstUser, second: secondUser },
    output: secondUser.overlay.outputs[0],
  };
}

export function constructGroupFilters({
  start,
  group,
}: {
  group: ArtifactSliceGroup;
  start: number;
}) {
  // only one artifact
}

export function constructCallArtifactsFilters({
  groups,
  start,
  duration,
}: {
  groups: ArtifactSliceGroup[];
  start: number;
  duration: number;
}) {}

export async function joinVideos({
  first,
  second,
  output,
}: {
  first: string;
  second: string;
  output: string;
}) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(first)
      .input(second)
      .addOption("-threads 1")
      .complexFilter([
        "[0:a][1:a]amix=inputs=2:duration=longest[amixed]",
        "[0]scale=640:720[0scaled]",
        "[1]scale=640:720[1scaled]",
        "[0scaled]pad=1280:720[0padded]",
        "[0padded][1scaled]overlay=shortest=1:x=640[output]", // todo: overlay the longest!
      ])
      .outputOptions(["-map [amixed]"])
      .outputOptions(["-map [output]"])
      .output(output)
      .on("error", reject)
      .on("progress", function (progress) {
        if (!progress.percent) return;
        console.log(
          `Processing ${first} and ${second} ${progress.percent.toFixed(2)} %`
            .gray
        );
      })
      .on("end", function () {
        resolve(output);
      })
      .run();
  });
}
