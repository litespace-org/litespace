import { backends } from "@/client";
import { Backend } from "@litespace/types";

export function asAssetUrl(backend: Backend, file: string): string {
  const base = backends.main[backend];
  return new URL(`/assets/${file}`, base).toString();
}

export function asRecriptUrl(backend: Backend, file: string) {
  const base = backends.main[backend];
  return new URL(`/assets/receipts/${file}`, base).toString();
}
