import { Router } from "express";
import asset from "@/handlers/asset";

const router = Router();

router.get("/sample", asset.sample);

export default router;
