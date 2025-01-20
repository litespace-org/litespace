import { Backend } from "@litespace/types";
import { asAssetUrl, asRecriptUrl } from "@litespace/atlas";
import zod from "zod";

export const backend = zod
  .enum([Backend.Local, Backend.Production, Backend.Staging])
  .parse(import.meta.env.VITE_BACKEND);

export function asFullAssetUrl(name?: string | null): string | null {
  if (!name) return null;
  return asAssetUrl(backend, name);
}

export function asFullRecriptUrl(name: string) {
  return asRecriptUrl(backend, name);
}
