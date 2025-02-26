import { CacheKey } from "@/constants";

export interface AbstractStorage {
  set: <T>(key: CacheKey, value: T) => T;
  get: <T>(key: CacheKey) => T | null;
  remove: (key: CacheKey) => void;
}
