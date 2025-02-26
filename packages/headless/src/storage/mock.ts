import { CacheKey } from "@/constants/cache";
import { AbstractStorage } from "@/storage/types";

export class MockStorage implements AbstractStorage {
  set<T>(_key: CacheKey, value: T): T {
    return value;
  }

  get<T>(): T | null {
    return null;
  }

  remove(): void {}
}
