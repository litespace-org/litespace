import { Backend } from "@litespace/types";
import { Atlas, asAssetUrl } from "@litespace/atlas";
import { getToken } from "@/lib/cache";
import zod from "zod";

export const backend = zod
  .enum([Backend.Local, Backend.Production, Backend.Staging])
  .parse(import.meta.env.VITE_BACKEND);

export function asFullAssetUrl(name: string) {
  return asAssetUrl(backend, name);
}

export const atlas = new Atlas(backend, getToken);