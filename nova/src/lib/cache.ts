import { CacheKey } from "@/constants/cache";

function load<T>(key: CacheKey): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(key);
}

function save<T>(key: CacheKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const cache = { save, load };
