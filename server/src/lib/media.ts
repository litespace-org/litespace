import { serverConfig } from "@/constants";
import { UploadedFile } from "express-fileupload";
import { isArray } from "lodash";
import path from "node:path";

export async function upload(files: UploadedFile | UploadedFile[]) {
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
