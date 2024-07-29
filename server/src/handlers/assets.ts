import { serverConfig } from "@/constants";
import { badRequest, forbidden } from "@/lib/error";
import { enforceRequest } from "@/middleware/accessControl";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { isArray } from "lodash";
import path from "node:path";
import fs from "node:fs/promises";

async function upload(req: Request, res: Response, next: NextFunction) {
  const media = req.files?.media;
  if (!media) return next(badRequest());

  const files = isArray(media) ? media : [media];

  const filenames = await Promise.all(
    files.map(async (file) => {
      const filename = Date.now() + "-" + file.name;
      await file.mv(path.join(serverConfig.media.directory, filename));
      return filename;
    })
  );

  res.status(200).json({ filenames });
}

async function viewAssets(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  const assets = await fs.readdir(serverConfig.media.directory);
  res.status(200).json(assets);
}

export default {
  upload: asyncHandler(upload),
  viewAssets: asyncHandler(viewAssets),
};
