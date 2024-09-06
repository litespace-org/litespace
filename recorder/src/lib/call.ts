import { serverConfig } from "@/config";
import path from "path";
import { number } from "@/lib/utils";

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
