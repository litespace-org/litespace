import { serverConfig } from "@/config";
import path from "path";

export function asRecordingPath(call: number, user: number) {
  return path.join(serverConfig.assets, `${call}-${user}.mp4`);
}

export function asProcessedPath(call: number) {
  return path.join(serverConfig.assets, `${call}.mp4`);
}
