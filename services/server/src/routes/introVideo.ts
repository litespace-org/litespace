import introVideo from "@/handlers/introVideo";
import { uploadMiddleware } from "@/lib/assets";
import { IIntroVideo } from "@litespace/types";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  uploadMiddleware.fields([
    { name: IIntroVideo.AssetFileName.Video, maxCount: 1 },
  ]),
  introVideo.create
);

export default router;
