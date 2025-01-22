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
  name,
  type,
}: {
  data: Buffer;
  type?: string;
  name?: string;
}) {
  const key = name || uuid();
  await s3.put({ key, data, type });
  return key;
}

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
});
