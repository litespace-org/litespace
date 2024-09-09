import { serverConfig } from "@/config";
import path from "path";
import { number } from "@/lib/utils";
import { globSync } from "glob";
import { Artifact, getVideoDuration, withAudio } from "@/lib/ffmpeg";
import { entries } from "lodash";

type RecordingInfo = {
  call: number;
  user: number;
  timestamp: number;
  screen?: boolean;
};

export function asRecordingPath({
  call,
  user,
  screen,
  timestamp,
}: RecordingInfo) {
  const prefix = `${timestamp}.${call}.${user}`;
  const name = screen ? `${prefix}.screen.webm` : `${prefix}.webm`;
  return path.join(serverConfig.assets, name);
}

export function parseCallRecording(file: string): RecordingInfo {
  const regex = /(\d+)\.(\d+)\.(\d+)(\.screen)?\.webm/;
  const match = file.match(regex);
  if (!match) throw new Error("Invalid file name");
  const timestamp = number(match[1]);
  const call = number(match[2]);
  const user = number(match[3]);
  const screen = match[4] === ".screen";

  return {
    call,
    user,
    screen,
    timestamp,
  };
}

export function asProcessedPath(call: number) {
  return path.join(serverConfig.assets, `${call}.mp4`);
}

export async function findCallArtifacts(
  call: number
): Promise<{ files: string[]; artifacts: Artifact[] }> {
  const files = globSync(path.join(serverConfig.assets, `*.${call}.*`));
  const artifacts: Artifact[] = [];

  for (const [idx, file] of entries(files)) {
    const info = parseCallRecording(file);
    const duration = await getVideoDuration(file);
    const audio = await withAudio(file);
    artifacts.push({
      id: number(idx),
      start: info.timestamp,
      duration,
      screen: info.screen,
      file,
      audio,
    });
  }

  return { files, artifacts };
}
