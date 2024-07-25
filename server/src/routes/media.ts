import { Router } from "express";
import media from "@/handlers/media";

const router = Router();

router.post("/upload", media.upload);

export default router;
