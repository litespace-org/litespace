import { CacheKey } from "@/constants";

export interface AbstractStorage {
  set: <T>(key: CacheKey, value: T) => Promise<T>;
  get: <T>(key: CacheKey) => Promise<T | null>;
  remove: (key: CacheKey) => Promise<void>;
}
