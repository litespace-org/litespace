import { CacheKey } from "@/constants/cache";

function load<T>(key: CacheKey): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(value);
}

function save<T>(key: CacheKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: CacheKey): void {
  localStorage.removeItem(key);
}

export function saveToken(token: string) {
  return save(CacheKey.AuthToken, token);
}

export function getAuthToken(): string | null {
  return load(CacheKey.AuthToken);
}

export function removeAuthToken() {
  return remove(CacheKey.AuthToken);
}

export const cache = { save, load };
