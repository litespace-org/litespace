import { backends } from "@/client";
import { Backend } from "@litespace/types";

export function asAssetUrl(backend: Backend, file: string): string {
  const base = backends.main[backend];
  return new URL(`/assets/${file}`, base).toString();
}

export function asCallRecordingUrl(backend: Backend, call: number) {
  const base = backends.recorder[backend];
  return new URL(`/${call}.mp4`, base).toString();
}
