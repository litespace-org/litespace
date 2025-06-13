import s3 from "@/lib/s3";
import { Request } from "express";
import { isArray } from "lodash";
import { v4 as uuid } from "uuid";
import multer from "multer";
import bytes from "bytes";

export function getRequestFile(
  files: Request["files"],
  name: string
): Express.Multer.File | null {
  if (!files || isArray(files)) return null;
  const file = files[name];
  if (!file) return null;
  const [first] = file;
  return first || null;
}

export async function upload({
  data,
  key,
  type,
}: {
  data: Buffer;
  type?: string;
  key?: string | null;
}) {
  const id = key || uuid();
  await s3.put({ key: id, data, type });
  return id;
}

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
});

/**
 * Check if a file size exceeds a certain limit.
 * @param size: the size of the file in bytes.
 * @param max: the max size of the file in megabytes.
 */
export function exceedsSizeLimit(size: number, max: number): boolean {
  const limit = bytes(`${max}mb`);
  if (!limit) throw new Error(`invalid size: ${max}mb`);
  return size > limit;
}

export async function withFileUrl<T extends object>(
  data: T,
  files: Array<keyof T>
) {
  for (const file of files) {
    const key = data[file];
    if (typeof key !== "string") continue;
    const url = await s3.get(key);
    data[file] = url as T[keyof T];
  }

  return data;
}

export async function withFileUrls<T extends object>(
  items: T[],
  files: Array<keyof T>
) {
  return await Promise.all(items.map((item) => withFileUrl(item, files)));
}
