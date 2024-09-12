import zod from "zod";
import { Backend } from "@litespace/types";
import { Atlas, asAssetUrl, asCallRecordingUrl } from "@litespace/atlas";

export const backend = zod
  .enum([Backend.Local, Backend.Production, Backend.Staging])
  .parse(import.meta.env.VITE_BACKEND);

export function asFullAssetUrl(name: string) {
  return asAssetUrl(backend, name);
}

export function asFullCallRecordingUrl(call: number) {
  return asCallRecordingUrl(backend, call);
}

export const atlas = new Atlas(backend);
