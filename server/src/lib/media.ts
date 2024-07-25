import { serverConfig } from "@/constants";
import { UploadedFile } from "express-fileupload";
import { first, isArray } from "lodash";
import path from "node:path";

export async function upload(
  files: UploadedFile | UploadedFile[]
): Promise<string[]> {
  const list = isArray(files) ? files : [files];

  const filenames = await Promise.all(
    list.map(async (file) => {
      if (file.mimetype !== "image/png")
        throw new Error("Unsupported media type");

      const filename = Date.now() + "-" + file.name;
      await file.mv(path.join(serverConfig.uploadsDir, filename));
      return filename;
    })
  );

  return filenames;
}

export async function uploadSingle(
  files: UploadedFile | UploadedFile[]
): Promise<string> {
  const list = isArray(files) ? files : [files];
  if (list.length !== 1) throw new Error("Expecting single file");
  const filenames = await upload(list);
  const filename = first(filenames);
  if (!filename)
    throw new Error("Uploaded file name is not found; should never happen");
  return filename;
}
