import { CacheKey } from "@/constants/cache";

export function save<T>(key: CacheKey, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function load<T>(key: CacheKey): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

export function remove(key: CacheKey) {
  localStorage.removeItem(key);
}

export const cache = {
  save,
  load,
  remove,
};
