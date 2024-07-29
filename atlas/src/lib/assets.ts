import { backendApiUrls } from "@/client";
import { Backend } from "@litespace/types";

export function asAssetUrl(backend: Backend, file: string): string {
  const base = backendApiUrls[backend];
  return new URL(`/assets/${file}`, base).toString();
}
