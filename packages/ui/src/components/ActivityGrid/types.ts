import { Dayjs } from "dayjs";

export type ActivityMap<T = unknown> = Record<string, ActivityMapValue<T>>;
export type ActivityMapValue<T = unknown> = T & { score: number };
export type GridDay<T = unknown> = {
  date: Dayjs;
  value: ActivityMapValue<T> | null;
};

export type FullGrid<T> = GridDay<T>[][];
