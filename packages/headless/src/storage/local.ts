import { CacheKey } from "@/constants/cache";
import { AbstractStorage } from "@/storage/types";

export class LocalStorage implements AbstractStorage {
  set<T>(key: CacheKey, value: T): T {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  get<T>(key: CacheKey): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return parsed as T;
  }

  remove(key: CacheKey): void {
    localStorage.removeItem(key);
  }
}
