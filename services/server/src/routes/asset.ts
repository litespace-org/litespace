import { Router } from "express";
import assets from "@/handlers/assets";
import { uploadMiddleware } from "@/lib/assets";
import { IAsset } from "@litespace/types";

const router = Router();

router.post(
  "/",
  uploadMiddleware.fields([
    { name: IAsset.AssetType.Photo, maxCount: 1 },
    { name: IAsset.AssetType.Video, maxCount: 1 },
  ]),
  assets.upload
);

router.delete("/", assets.drop);

export default router;
