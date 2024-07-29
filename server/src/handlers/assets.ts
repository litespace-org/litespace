import { serverConfig } from "@/constants";
import { badRequest, forbidden, notfound } from "@/lib/error";
import { enforceRequest } from "@/middleware/accessControl";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { isArray } from "lodash";
import path from "node:path";
import fs from "node:fs/promises";
import http from "@/validation/http";

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

async function removeAsset(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { name } = http.assets.remove.params.parse(req.params);
  const asset = path.join(serverConfig.media.directory, name);
  const exists = await fs
    .access(asset)
    .then(() => true)
    .catch(() => false);
  if (!exists) return next(notfound());

  await fs.rm(asset);
  res.status(200).send();
}

export default {
  upload: asyncHandler(upload),
  viewAssets: asyncHandler(viewAssets),
  removeAsset: asyncHandler(removeAsset),
};
