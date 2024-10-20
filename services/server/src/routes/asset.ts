import { Router } from "express";
import assets from "@/handlers/assets";

const router = Router();

router.get("/list", assets.viewAssets);
router.delete("/:name", assets.removeAsset);

export default router;
