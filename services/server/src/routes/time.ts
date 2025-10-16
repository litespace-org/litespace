import { Router } from "express";
import time from "@/handlers/time";

const router = Router();

router.get("/current", time.currentZoneTime);

export default router;
