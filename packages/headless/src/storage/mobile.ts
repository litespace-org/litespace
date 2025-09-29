import AsyncStorage from "@react-native-async-storage/async-storage";
import { AbstractStorage } from "@/storage/types";
import { CacheKey } from "@/constants/cache";

export class MobileStorage implements AbstractStorage {
  async set<T>(key: CacheKey, value: T): Promise<T> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  async get<T>(key: CacheKey): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return parsed as T;
  }

  async remove(key: CacheKey): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
