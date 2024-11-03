import { backends } from "@/client";
import { Backend } from "@litespace/types";

export function asAssetUrl(backend: Backend, file: string): string {
  const base = backends.main[backend];
  return new URL(`/assets/${file}`, base).toString();
}
