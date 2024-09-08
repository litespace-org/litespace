import { serverConfig } from "@/config";
import path from "path";
import { number } from "@/lib/utils";
import { globSync } from "glob";
import fs from "node:fs/promises";
import { getVideoDurationInSeconds } from "get-video-duration";
import { MILLISECONDS_IN_SECOND } from "@/constants/time";
import { Artifact } from "./ffmpeg";

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
  const name = screen ? `${prefix}.screen.mp4` : `${prefix}.mp4`;
  return path.join(serverConfig.assets, name);
}

export function parseCallRecording(file: string): RecordingInfo {
  const regex = /(\d+)\.(\d+)\.(\d+)(\.screen)?\.mp4/;
  const match = file.match(regex);
  if (!match) throw new Error("Invalid file name");
  const timestamp = number(match[1]);
  const call = number(match[2]);
  const user = number(match[3]);
  const screen = match[4] === ".screen";

  return {
    call,
    user,
    timestamp,
    screen,
  };
}

export function asProcessedPath(call: number) {
  return path.join(serverConfig.assets, `${call}.mp4`);
}

export async function findCallArtifacts(
  call: number
): Promise<{ files: string[]; artifacts: Artifact[] }> {
  const files = globSync(path.join(serverConfig.assets, `*.${call}.*`));
  const artifacts: Artifact[] = await Promise.all(
    files.map(async (file, idx) => {
      const info = parseCallRecording(file);
      const duration = await getCallDuration(file);
      return {
        id: idx,
        start: info.timestamp,
        duration,
        screen: info.screen,
      };
    })
  );
  return { files, artifacts };
}

export async function getCallDuration(path: string): Promise<number> {
  const duration = await getVideoDurationInSeconds(path);
  return duration * MILLISECONDS_IN_SECOND;
}
