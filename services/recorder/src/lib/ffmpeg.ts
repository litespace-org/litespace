import ffmpeg, { ffprobe, FfprobeData } from "fluent-ffmpeg";
import { nameof, number, omitByIdex } from "@/lib/utils";
import {
  entries,
  first,
  flattenDeep,
  isEmpty,
  last,
  map,
  orderBy,
  range,
  uniq,
} from "lodash";
import { FilterChain } from "@/lib/filter";
import { mediaConfig } from "@/config";
import { logger } from "@/lib/log";
import { asGroupArtifactPath, asProcessedPath } from "@/lib/call";
import { exec } from "node:child_process";
import { MILLISECONDS_IN_SECOND } from "@/constants/time";
import fs from "node:fs/promises";

export type Artifact = {
  id: number;
  start: number;
  duration: number;
  screen?: boolean;
  file: string;
  audio: boolean;
};

export type ArtifactSlice = { start: number; end: number };

export type ArtifactSliceGroup = ArtifactSlice & { artifacts: Artifact[] };

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
    slices: ArtifactSlice[];
    artifact: Artifact;
  }>
): ArtifactSliceGroup[] {
  const map: Record<string, Artifact[]> = {};
  for (const artifact of artifacts) {
    for (const slice of artifact.slices) {
      if (slice.start === slice.end) continue;
      const key = `${slice.start}:${slice.end}`;
      if (map[key]) map[key].push(artifact.artifact);
      else map[key] = [artifact.artifact];
    }
  }

  return entries(map).map(([key, value]) => {
    const [start, end] = key.split(":");
    return {
      start: number(start),
      end: number(end),
      artifacts: value,
    };
  });
}

function asList(filter: OverlayedVideoFilters): FilterChain[] {
  return [filter.cut, filter.scale, filter.overlay];
}

function asArtifactGroupId(group: number, artifact: number): string {
  return [group, artifact].join("-");
}

export enum View {
  /**
   * One user
   */
  FullScreen,
  /**
   * Two users. Side by side
   */
  SplitScreen,
  /**
   * One user and one screen.
   */
  SoloPersenter,
  /**
   * Two users and one screen
   */
  AccompaniedPersenter,
  /**
   * Two users and two screens
   */
  MultiPersenter,
}

// todo: pass "artifacts" and not ids
export function selectBestView(artifacts: Artifact[]) {
  const screenCount = (count: number) => {
    return artifacts.filter((artifact) => artifact.screen).length === count;
  };

  const userCount = (count: number) => {
    return artifacts.filter((artifact) => !artifact.screen).length === count;
  };

  if (screenCount(2) && userCount(2)) return View.MultiPersenter;
  if (screenCount(1) && userCount(2)) return View.AccompaniedPersenter;
  if (screenCount(1) && userCount(1)) return View.SoloPersenter;
  if (screenCount(0) && userCount(2)) return View.SplitScreen;
  if (screenCount(0) && userCount(1)) return View.FullScreen;
  return null;
}

function createVideoTemplate({
  output,
  duration,
}: {
  output: string;
  duration: number;
}) {
  const { width, height } = mediaConfig.recordingDim;
  return FilterChain.init()
    .black({ w: width, h: height }, duration)
    .withOutput(output);
}

export function computeGroupFilterGraph({
  group,
  input,
  anchor,
  groupId,
}: {
  group: ArtifactSliceGroup;
  input: string;
  anchor: number;
  groupId: number;
}): { filters: FilterChain[]; output: string } | null {
  const slice = { start: group.start, end: group.end };
  const view = selectBestView(group.artifacts);

  const id = (artifactId: number) => asArtifactGroupId(groupId, artifactId);

  if (view === null) return null; // invalid or unsupported group

  if (view === View.FullScreen) {
    const artifact = first(group.artifacts);
    if (!artifact) return null;

    const filters = asFullScreenView({
      ids: { artifact: id(artifact.id), input },
      start: { anchor: anchor, artifact: artifact.start },
      index: artifact.id,
      slice,
    });

    return {
      filters: [filters.cut, filters.scale, filters.overlay],
      output: filters.output,
    };
  }
  if (view === View.SplitScreen) {
    const [left, right] = group.artifacts;
    if (!left || !right) return null;

    const filters = asSplitScreenView({
      ids: { artifacts: { left: id(left.id), right: id(right.id) }, input },
      indices: { left: left.id, right: right.id },
      slice,
      start: {
        artifacts: { left: left.start, right: right.start },
        anchor,
      },
    });

    return {
      filters: [...asList(filters.left), ...asList(filters.right)],
      output: filters.output,
    };
  }

  if (view === View.SoloPersenter) {
    const screen = group.artifacts.find((a) => a.screen);
    const persenter = group.artifacts.find((a) => !a.screen);
    if (!screen || !persenter) return null;

    const filters = asSoloPersenterView({
      slice,
      ids: { input, presenter: id(persenter.id), screen: id(screen.id) },
      indices: { screen: screen.id, presenter: persenter.id },
      start: {
        anchor,
        presenter: persenter.start,
        screen: screen.start,
      },
    });

    return {
      filters: [...asList(filters.screen), ...asList(filters.presenter)],
      output: filters.output,
    };
  }

  if (view === View.AccompaniedPersenter) {
    const screen = group.artifacts.find((a) => a.screen);
    const [firstUser, secondUser] = group.artifacts.filter((a) => !a.screen);
    if (!screen || !firstUser || !secondUser) return null;

    const filters = asAccompaniedPersenterView({
      ids: {
        input,
        screen: id(screen.id),
        users: [id(firstUser.id), id(secondUser.id)],
      },
      indices: { screen: screen.id, users: [firstUser.id, secondUser.id] },
      slice,
      start: {
        anchor,
        screen: screen.start,
        users: [firstUser.start, secondUser.start],
      },
    });

    return {
      filters: [
        ...asList(filters.screen),
        ...asList(filters.users.first),
        ...asList(filters.users.second),
      ],
      output: filters.output,
    };
  }

  if (view === View.MultiPersenter) {
    const [firstScreen, secondScreen] = group.artifacts.filter((a) => a.screen);
    const [firstUser, secondUser] = group.artifacts.filter((a) => !a.screen);
    if (!firstScreen || !secondScreen || !firstUser || !secondUser) return null;

    const filters = asMultiPersenterView({
      ids: {
        input,
        screens: [id(firstScreen.id), id(secondScreen.id)],
        users: [id(firstUser.id), id(secondUser.id)],
      },
      indices: {
        screens: [firstScreen.id, secondScreen.id],
        users: [firstUser.id, secondUser.id],
      },
      slice,
      start: {
        anchor,
        screens: [firstScreen.start, secondScreen.start],
        users: [firstUser.start, secondUser.start],
      },
    });

    return {
      filters: [
        ...asList(filters.screens.first),
        ...asList(filters.screens.second),
        ...asList(filters.users.first),
        ...asList(filters.users.second),
      ],
      output: filters.output,
    };
  }

  return null;
}

export function synchronizeArtifactsAudio({
  anchor,
  artifacts,
  template,
  output,
  duration,
}: {
  anchor: number;
  artifacts: Artifact[];
  template: number;
  output: string;
  duration: number;
}) {
  const templateOutput = "template-output";
  const trimAudio = FilterChain.init()
    .withInput(template)
    .atrim({ start: 0, end: duration })
    .withOutput(templateOutput);

  const filters: FilterChain[] = [trimAudio];
  const outputs: string[] = [];

  for (const artifact of artifacts) {
    const delay = artifact.start - anchor;
    const output = `${artifact.id}-a`;

    const filter = FilterChain.init()
      .withInput(artifact.id)
      .adelay(delay)
      .withOutput(`${artifact.id}-a`);

    filters.push(filter);
    outputs.push(output);
  }

  const inputs = [...outputs, templateOutput];
  const filter = FilterChain.init()
    .withInput(...inputs)
    .amix(inputs.length)
    .withOutput(output);

  return [...filters, filter];
}

export async function processArtifacts({
  artifacts,
  files,
  call,
}: {
  artifacts: Artifact[];
  files: string[];
  call: number;
}) {
  const groups = groupArtifacts(
    artifacts.map((artifact, idx) => {
      const breakpoints = findBreakPoints(artifact, omitByIdex(artifacts, idx));
      const slices = asArtifactSlices(artifact, breakpoints);
      return { slices, artifact };
    })
  );

  const intermediateArtifacts: string[] = [];
  const orderedGroups = orderBy(groups, "start", "asc");
  const audioOutput = "audio";
  const videoOutput = "video";
  const videoInput = "input";

  for (const [groupId, group] of entries(orderedGroups)) {
    const result = computeGroupFilterGraph({
      groupId: number(groupId),
      input: videoInput,
      anchor: group.start, // anchor its group to itself
      group,
    });
    if (result === null) continue; // invalid or unsupported group

    const output = last(result.filters);
    if (output) output.overrideOutput(videoOutput);

    const tmp = asGroupArtifactPath(call, groupId);
    const groupDuration = group.end - group.start;
    const template = createVideoTemplate({
      output: videoInput,
      duration: groupDuration,
    });

    const filters = [template, ...result.filters];
    await processFilters({
      files,
      filters,
      output: tmp,
      video: videoOutput,
      prefix: `${number(groupId) + 1}/${groups.length}`,
    });
    intermediateArtifacts.push(tmp);
  }

  // join all groups into one video
  const sound = "templates/30-minutes-of-silence.mp3";
  const audioOnly = artifacts.filter((artifact) => artifact.audio);
  const all = [...map(artifacts, "file"), sound, ...intermediateArtifacts];
  const anchor = first(orderedGroups)?.start || 0;
  const lastGroup = last(orderedGroups)?.end || 0;
  const duration = lastGroup - anchor; // duration in miliseconds
  const template = files.length;
  const indices = range(template + 1, all.length);
  const concat = FilterChain.init()
    .concat(intermediateArtifacts.length)
    .withInput(...indices)
    .withOutput(videoOutput);

  const audio = synchronizeArtifactsAudio({
    output: audioOutput,
    artifacts: audioOnly,
    template,
    duration,
    anchor,
  });

  await processFilters({
    files: all,
    filters: [concat, ...audio],
    output: asProcessedPath(call),
    video: videoOutput,
    audio: audioOutput,
    prefix: call.toString(),
  });

  await deleteArtifacts(intermediateArtifacts.concat(map(artifacts, "file")));
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
  output: string;
};

type OverlayVideoParams = {
  start: { anchor: number; artifact: number };
  ids: { artifact: string; input: string };
  /**
   * Artifact index in ffmpeg inputs list
   */
  index: number;
  dims: { width: number; height: number };
  slice: ArtifactSlice;
  pos?: { x?: number; y?: number };
};

function overlayVideo({
  ids,
  index,
  slice,
  start,
  dims,
  pos = {},
}: OverlayVideoParams): OverlayedVideoFilters {
  const playTime = calculateRelativeTime(start.anchor, slice);
  const trimTime = calculateRelativeTime(start.artifact, slice);
  const tirmOutput = `trim-${ids.artifact}`;
  const scaleOutput = `scale-${ids.artifact}`;
  const overlayOutput = `overlay-${ids.artifact}`;

  const first = FilterChain.init()
    .trim(trimTime.start, trimTime.end)
    .withInput(index)
    .withOutput(tirmOutput);

  const second = FilterChain.init()
    .vdelay(playTime.start)
    .scale({ w: dims.width, h: dims.height })
    .withInput(tirmOutput)
    .withOutput(scaleOutput);

  const overlay = FilterChain.init()
    .withInput(ids.input, scaleOutput)
    .overlay()
    .withOutput(overlayOutput);

  if (pos.x) overlay.overlayx(pos.x);
  if (pos.y) overlay.overlayy(pos.y);

  return { cut: first, scale: second, overlay, output: overlayOutput };
}

export function asFullScreenView({
  ids,
  slice,
  index,
  start,
}: {
  ids: OverlayVideoParams["ids"];
  index: OverlayVideoParams["index"];
  slice: OverlayVideoParams["slice"];
  start: OverlayVideoParams["start"];
}): OverlayedVideoFilters {
  return overlayVideo({
    ids,
    index,
    slice,
    start,
    dims: mediaConfig.recordingDim, // full screen
  });
}

export function asSplitScreenView({
  start,
  slice,
  ids,
  indices,
}: {
  start: { anchor: number; artifacts: { left: number; right: number } };
  slice: ArtifactSlice;
  ids: { artifacts: { left: string; right: string }; input: string };
  indices: { left: number; right: number };
}): {
  left: OverlayedVideoFilters;
  right: OverlayedVideoFilters;
  output: string;
} {
  const { width, height } = mediaConfig.recordingDim;

  const left = overlayVideo({
    start: { artifact: start.artifacts.left, anchor: start.anchor },
    ids: { artifact: ids.artifacts.left, input: ids.input },
    dims: { width: width / 2, height },
    index: indices.left,
    slice,
  });

  const right = overlayVideo({
    start: { artifact: start.artifacts.right, anchor: start.anchor },
    ids: { artifact: ids.artifacts.right, input: left.output },
    dims: { width: width / 2, height },
    pos: { x: width / 2 },
    index: indices.right,
    slice,
  });

  return { left, right, output: right.output };
}

export function asSoloPersenterView({
  slice,
  ids,
  start,
  indices,
}: {
  slice: ArtifactSlice;
  ids: { screen: string; presenter: string; input: string };
  start: { anchor: number; presenter: number; screen: number };
  indices: { screen: number; presenter: number };
}): {
  screen: OverlayedVideoFilters;
  presenter: OverlayedVideoFilters;
  output: string;
} {
  const screen = asFullScreenView({
    slice,
    start: { anchor: start.anchor, artifact: start.screen },
    ids: { artifact: ids.screen, input: ids.input },
    index: indices.screen,
  });

  const { width, height } = mediaConfig.recordingDim;
  const w = Math.floor(width / 5);
  const h = Math.floor(height / 5);
  const x = width - w - 10;
  const y = height - h - 10;

  const presenter = overlayVideo({
    ids: { artifact: ids.presenter, input: screen.output },
    start: { artifact: start.presenter, anchor: start.anchor },
    dims: { width: w, height: h },
    index: indices.presenter,
    pos: { x, y },
    slice,
  });

  return { screen, presenter, output: presenter.output };
}

/**
 * Two users and one screen
 */
export function asAccompaniedPersenterView({
  ids,
  start,
  slice,
  indices,
}: {
  ids: { input: string; screen: string; users: [string, string] };
  start: { anchor: number; screen: number; users: [number, number] };
  indices: { screen: number; users: [number, number] };
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
    ids: { artifact: ids.screen, input: ids.input },
    start: { artifact: start.screen, anchor: start.anchor },
    dims: { width: sw, height },
    index: indices.screen,
    slice,
  });

  const firstUser = overlayVideo({
    ids: { artifact: ids.users[0], input: screen.output },
    start: { artifact: start.users[0], anchor: start.anchor },
    dims: { width: uw, height: uh },
    index: indices.users[0],
    pos: { x: ux, y: fuy },
    slice,
  });

  const secondUser = overlayVideo({
    ids: { artifact: ids.users[1], input: firstUser.output },
    start: { artifact: start.users[1], anchor: start.anchor },
    dims: { width: uw, height: uh },
    pos: { x: ux, y: suy },
    index: indices.users[1],
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
  indices,
}: {
  ids: { input: string; screens: [string, string]; users: [string, string] };
  start: { anchor: number; screens: [number, number]; users: [number, number] };
  indices: { screens: [number, number]; users: [number, number] };
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
    ids: { artifact: ids.screens[0], input: ids.input },
    start: { artifact: start.screens[0], anchor: start.anchor },
    dims: { width: sw, height: sh },
    pos: { x: fsx, y: fsy },
    index: indices.screens[0],
    slice,
  });

  const secondScreen = overlayVideo({
    ids: { artifact: ids.screens[1], input: firstScreen.output },
    start: { artifact: start.screens[1], anchor: start.anchor },
    dims: { width: sw, height: sh },
    pos: { x: ssx, y: ssy },
    index: indices.screens[1],
    slice,
  });

  const firstUser = overlayVideo({
    ids: { artifact: ids.users[0], input: secondScreen.output },
    start: { artifact: start.users[0], anchor: start.anchor },
    dims: { width: uw, height: uh },
    pos: { x: fux, y: fuy },
    index: indices.users[0],
    slice,
  });

  const secondUser = overlayVideo({
    ids: { artifact: ids.users[1], input: firstUser.output },
    start: { artifact: start.users[1], anchor: start.anchor },
    dims: { width: uw, height: uh },
    pos: { x: sux, y: suy },
    index: indices.users[1],
    slice,
  });

  return {
    screens: { first: firstScreen, second: secondScreen },
    users: { first: firstUser, second: secondUser },
    output: secondUser.output,
  };
}

export async function deleteArtifacts(files: string[]) {
  for (const file of files) {
    logger(nameof(deleteArtifacts)).log(`Deleting ${file}`);
    await fs.unlink(file);
    logger(nameof(deleteArtifacts)).success(`${file} Deleted`);
  }
}

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

function processFilters({
  files,
  filters,
  output,
  video,
  audio,
  prefix = "",
}: {
  files: string[];
  filters: FilterChain[];
  video: string;
  audio?: string;
  output: string;
  prefix?: string;
}) {
  return new Promise((resolve, reject) => {
    const { log } = logger(nameof(processArtifacts), output, prefix);
    log({ files, filters: filters.map((filter) => filter.toString()) });

    const comand = ffmpeg()
      .withOption("-threads 1")
      .complexFilter(filters.map((filter) => filter.toString()))
      .outputOptions([`-map [${video}]`])
      .output(output)
      .on("error", reject)
      .on("progress", function (progress) {
        if (progress.percent)
          return log(`Processing ${progress.percent.toFixed(2)} %`);
        return log(`Processing: ${progress.timemark}`);
      })
      .on("end", () => resolve(output));

    for (const file of files) comand.input(file);
    if (audio) comand.outputOptions([`-map [${audio}]`]);

    comand.run();
  });
}

export async function withAudio(file: string): Promise<boolean> {
  const metadata = await getMediaMetadata(file);
  return metadata.streams.some((stream) => stream.codec_type === "audio");
}

/**
 * Get video duration in miliseconds
 */
export async function getVideoDuration(file: string): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(
      `ffprobe -v 0 -hide_banner -of compact=p=0:nk=1 -show_entries packet=pts_time -read_intervals 99999%+#1000 ${file} | tail -1`,
      (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(stdout);
        try {
          const duration = number(stdout.trim());
          return resolve(duration * MILLISECONDS_IN_SECOND);
        } catch (error) {
          return reject(error);
        }
      }
    );
  });
}

function getMediaMetadata(
  file: string,
  options: string[] = []
): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffprobe(file, options, (error: unknown, data: FfprobeData) => {
      if (error) return reject(error);
      return resolve(data);
    });
  });
}
