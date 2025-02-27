import s3 from "@/lib/s3";
import { Request } from "express";
import { isArray } from "lodash";
import { v4 as uuid } from "uuid";
import multer from "multer";

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
