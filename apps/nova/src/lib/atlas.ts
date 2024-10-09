import { Backend } from "@litespace/types";
import { Atlas, asAssetUrl, asCallRecordingUrl } from "@litespace/atlas";

export const backend = Backend.Staging;

export function asFullAssetUrl(name: string) {
  return asAssetUrl(backend, name);
}

export function asFullCallRecordingUrl(call: number) {
  return asCallRecordingUrl(backend, call);
}

export const atlas = new Atlas(backend);
