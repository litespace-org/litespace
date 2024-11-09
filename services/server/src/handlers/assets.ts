import { serverConfig } from "@/constants";
import { forbidden, notfound } from "@/lib/error";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import path from "node:path";
import fs from "node:fs/promises";
import { isAdmin } from "@litespace/auth";
import zod from "zod";
import { pagination, string } from "@/validation/utils";
import { drop } from "lodash";
import { IAsset } from "@litespace/types";

const removeAssetsParams = zod.object({ name: string });

async function viewAssets(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());
  const { page, size } = pagination.parse(req.params);
  const assets = await fs.readdir(serverConfig.assets.directory.uploads);
  const offset = (page - 1) * size;
  const list = drop(assets, offset).slice(0, size);
  const response: IAsset.FindAssetsApiResponse = { list, total: assets.length };
  res.status(200).json(response);
}

async function removeAsset(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  const { name } = removeAssetsParams.parse(req.params);
  const asset = path.join(serverConfig.assets.directory.uploads, name);
  const exists = await fs
    .access(asset)
    .then(() => true)
    .catch(() => false);
  if (!exists) return next(notfound.asset());

  await fs.rm(asset);
  res.status(200).send();
}

export default {
  viewAssets: safeRequest(viewAssets),
  removeAsset: safeRequest(removeAsset),
};
