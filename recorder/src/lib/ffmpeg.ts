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

/**
 * @param base Absolute start time for the video track (the call start timestamp)
 * @param artifact target artifact slice
 */
export function constructFullScreenFilter({
  artifactStart,
  artifactId,
  slice,
  base,
  backgroundId,
}: {
  artifactStart: number;
  slice: ArtifactSlice;
  artifactId: number;
  base: number;
  backgroundId: string;
}) {
  const { width, height } = mediaConfig.recordingDim;
  const playTime = calculateRelativeTime(base, slice);
  const trimTime = calculateRelativeTime(artifactStart, slice);
  const tirmOutput = `trim-${artifactId}`;
  const scaleOutput = `scale-${artifactId}`;
  const overlayOutput = `overlay-${artifactId}`;

  const first = FilterChain.init()
    .trim(trimTime.start, trimTime.end)
    .withInput(artifactId)
    .withOutput(tirmOutput);

  const second = FilterChain.init()
    .vdelay(playTime.start)
    .scale({ w: width - 1, h: height - 1 })
    .withInput(tirmOutput)
    .withOutput(scaleOutput);

  const overlay = FilterChain.init()
    .withInput([backgroundId, scaleOutput])
    .overlay()
    .withOutput(overlayOutput);

  return { cut: first, scale: second, overlay };
}

function constructHalfScreenFilters({
  artifactStart,
  artifactId,
  slice,
  base,
  backgroundId,
  left,
}: {
  artifactStart: number;
  slice: ArtifactSlice;
  artifactId: number;
  base: number;
  backgroundId: string;
  left: boolean;
}) {
  const { width, height } = mediaConfig.recordingDim;
  const playTime = calculateRelativeTime(base, slice);
  const trimTime = calculateRelativeTime(artifactStart, slice);
  const tirmOutput = `trim-${artifactId}`;
  const scaleOutput = `scale-${artifactId}`;
  const overlayOutput = `overlay-${artifactId}`;

  const first = FilterChain.init()
    .trim(trimTime.start, trimTime.end)
    .withInput(artifactId)
    .withOutput(tirmOutput);

  const second = FilterChain.init()
    .vdelay(playTime.start)
    .scale({ w: width / 2, h: height })
    .withInput(tirmOutput)
    .withOutput(scaleOutput);

  const overlay = FilterChain.init()
    .withInput([backgroundId, scaleOutput])
    .overlay()
    .withOutput(overlayOutput);

  if (left === false) overlay.overlayx(width / 2);

  return { cut: first, scale: second, overlay };
}

export function constructSplitScreenFilters({
  artifacts,
  group,
  base,
  backgroundId,
}: {
  artifacts: [number, number];
  group: ArtifactSliceGroup;
  base: number;
  backgroundId: string;
}) {
  const [first, second] = artifacts;
  const [leftId, rightId] = group.ids;
  const slice = { start: group.start, end: group.end };

  const leftFilters = constructHalfScreenFilters({
    slice: { start: group.start, end: group.end },
    artifactStart: first,
    artifactId: leftId,
    backgroundId,
    left: true,
    base,
  });

  const rightFilters = constructHalfScreenFilters({
    backgroundId: leftFilters.overlay.outputs[0],
    artifactStart: second,
    artifactId: rightId,
    left: false,
    base,
    slice,
  });

  return { left: leftFilters, right: rightFilters };
}

export function constructSoloPresenterFilters({
  artifactStart,
  artifactId,
  slice,
  base,
  backgroundId,
}: {
  artifactStart: number;
  slice: ArtifactSlice;
  artifactId: number;
  base: number;
  backgroundId: string;
}) {
  const { width, height } = mediaConfig.recordingDim;
  const playTime = calculateRelativeTime(base, slice);
  const trimTime = calculateRelativeTime(artifactStart, slice);
  const tirmOutput = `trim-${artifactId}`;
  const scaleOutput = `scale-${artifactId}`;
  const overlayOutput = `overlay-${artifactId}`;

  const first = FilterChain.init()
    .trim(trimTime.start, trimTime.end)
    .withInput(artifactId)
    .withOutput(tirmOutput);

  const w = Math.floor(width / 5) - 1;
  const h = Math.floor(height / 5) - 1;
  const x = width - w - 10;
  const y = height - h - 10;

  const second = FilterChain.init()
    .vdelay(playTime.start)
    .scale({ w, h })
    .withInput(tirmOutput)
    .withOutput(scaleOutput);

  const overlay = FilterChain.init()
    .withInput([backgroundId, scaleOutput])
    .overlay()
    .overlayx(x)
    .overlayy(y)
    .withOutput(overlayOutput);

  return { cut: first, scale: second, overlay };
}

export function constructSoloPresenterScreenFilters({
  presenterId,
  presenterStart,
  screenStart,
  screenId,
  slice,
  base,
  backgroundId,
}: {
  screenStart: number;
  presenterStart: number;
  presenterId: number;
  screenId: number;
  slice: ArtifactSlice;
  base: number;
  backgroundId: string;
}) {
  const screen = constructFullScreenFilter({
    slice,
    artifactStart: screenStart,
    artifactId: screenId,
    backgroundId,
    base,
  });

  const presenter = constructSoloPresenterFilters({
    backgroundId: screen.overlay.outputs[0],
    artifactStart: presenterStart,
    artifactId: presenterId,
    base,
    slice,
  });

  return { screen, presenter };
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
