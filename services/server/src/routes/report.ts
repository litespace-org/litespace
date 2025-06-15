import report from "@/handlers/report";
import { uploadMiddleware } from "@/lib/assets";
import { IReport } from "@litespace/types";
import { Router } from "express";

const router = Router();

router.get("/list", report.find);

router.post(
  "/",
  uploadMiddleware.fields([
    { name: IReport.AssetFileName.Screenshot, maxCount: 1 },
    { name: IReport.AssetFileName.Log, maxCount: 1 },
  ]),
  report.create
);

router.put("/", report.update);

export default router;
