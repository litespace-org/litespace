import { CacheKey } from "@/constants/cache";
import { AbstractStorage } from "@/storage/types";
import { safe } from "@litespace/utils";

export class StorageWrapper {
  private storage: AbstractStorage;

  constructor(storage: AbstractStorage) {
    this.storage = storage;
  }

  save<T>(key: CacheKey, value: T) {
    this.storage.setItem(key, JSON.stringify(value));
    return value;
  }

  load<T>(key: CacheKey): T | null {
    const value = this.storage.getItem(key);
    if (!value) return null;
    const parsed = safe(() => JSON.parse(value));
    return (parsed || value) as T;
  }

  remove(key: CacheKey) {
    this.storage.removeItem(key);
  }
}
