import { isDev, isStaging } from "@/constants";

export function withDevLog<T>(data: T): T {
  if (isDev || isStaging) console.log(JSON.stringify(data, null, 2));
  return data;
}
