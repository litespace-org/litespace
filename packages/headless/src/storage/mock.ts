import { CacheKey } from "@/constants/cache";
import { AbstractStorage } from "@/storage/types";

export class MockStorage implements AbstractStorage {
  async set<T>(_key: CacheKey, value: T): Promise<T> {
    return value;
  }

  async get<T>(): Promise<T | null> {
    return null;
  }

  async remove(): Promise<void> {}
}
