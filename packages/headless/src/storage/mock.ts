import { AbstractStorage } from "@/storage/types";

export const mockStorage: AbstractStorage = {
  setItem: (key: string, value: string) => console.log(key, value),
  getItem: (key: string) => key,
  removeItem: (key: string) => console.log(key),
};
