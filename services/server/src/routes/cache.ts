import { Router } from "express";
import cache from "@/handlers/cache";

const router = Router();

router.delete("/flush", cache.flush);

export default router;
