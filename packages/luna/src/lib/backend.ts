import { Backend } from "@litespace/types";
import { Atlas, TokenType, asAssetUrl, asRecriptUrl } from "@litespace/atlas";
import { getAuthToken } from "@/lib/cache";
import zod from "zod";

export const backend = zod
  .enum([Backend.Local, Backend.Production, Backend.Staging])
  .parse(import.meta.env.VITE_BACKEND);

export function asFullAssetUrl(name: string) {
  return asAssetUrl(backend, name);
}

export function asFullRecriptUrl(name: string) {
  return asRecriptUrl(backend, name);
}

export const atlas = new Atlas(backend, () => {
  const token = getAuthToken();
  if (!token) return null;
  return { type: TokenType.Bearer, value: token };
});
