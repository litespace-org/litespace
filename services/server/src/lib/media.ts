import { FileType, serverConfig } from "@/constants";
import { UploadedFile } from "express-fileupload";
import { first, includes, isArray } from "lodash";
import path from "node:path";

export async function upload(
  files: UploadedFile | UploadedFile[],
  type: FileType
): Promise<string[]> {
  const list = isArray(files) ? files : [files];

  const filenames = await Promise.all(
    list.map(async (file) => {
      if (!includes(serverConfig.media.supported[type], file.mimetype))
        throw new Error("Unsupported media type");

      const filename = Date.now() + "-" + file.name;
      await file.mv(path.join(serverConfig.media.directory, filename));
      return filename;
    })
  );

  return filenames;
}

export async function uploadSingle(
  files: UploadedFile | UploadedFile[],
  type: FileType
): Promise<string> {
  const list = isArray(files) ? files : [files];
  if (list.length !== 1) throw new Error("Expecting single file");
  const filenames = await upload(list, type);
  const filename = first(filenames);
  if (!filename)
    throw new Error("Uploaded file name is not found; should never happen");
  return filename;
}
