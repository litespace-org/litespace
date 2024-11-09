import { FileType, serverConfig } from "@/constants";
import { UploadedFile } from "express-fileupload";
import { first, includes, isArray } from "lodash";
import { join } from "node:path";
import dayjs from "@/lib/dayjs";

export async function upload(
  files: UploadedFile | UploadedFile[],
  type: FileType,
  directory: string
): Promise<string[]> {
  const list = isArray(files) ? files : [files];

  const filenames = await Promise.all(
    list.map(async (file) => {
      if (!includes(serverConfig.assets.supported[type], file.mimetype))
        throw new Error("Unsupported media type");

      const filename = Date.now() + "-" + file.name;
      const subdir = dayjs.utc().format("YYYY-MM");
      const path = join(subdir, filename);
      await file.mv(join(directory, path));
      return path;
    })
  );

  return filenames;
}

export async function uploadSingle(
  files: UploadedFile | UploadedFile[],
  type: FileType,
  directory: string
): Promise<string> {
  const list = isArray(files) ? files : [files];
  if (list.length !== 1) throw new Error("Expecting single file");
  const filenames = await upload(list, type, directory);
  const filename = first(filenames);
  if (!filename)
    throw new Error("Uploaded file name is not found; should never happen");
  return filename;
}
