import { serverConfig } from "@/config";
import path from "path";

export function asRecordingPath({
  call,
  user,
  screen,
  timestamp,
}: {
  call: number;
  user: number;
  timestamp: number;
  screen?: boolean;
}) {
  const prefix = `${timestamp}.${call}.${user}`;
  const name = screen ? `${prefix}.screen.mp4` : `${prefix}.mp4`;
  return path.join(serverConfig.assets, name);
}

export function asProcessedPath(call: number) {
  return path.join(serverConfig.assets, `${call}.mp4`);
}
