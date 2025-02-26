import { CacheKey } from "@/constants/cache";

export function save<T>(key: CacheKey, value: T) {
  if (typeof window === "undefined") return null;
  window.localStorage?.setItem(key, JSON.stringify(value));
  return value;
}

export function load<T>(key: CacheKey): T | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

export function remove(key: CacheKey) {
  if (typeof window === "undefined") return null;
  window.localStorage.removeItem(key);
}

export const cache = {
  save,
  load,
  remove,
};
