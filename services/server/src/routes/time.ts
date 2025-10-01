import { Router } from "express";
import time from "@/handlers/time";

const router = Router();

router.get("/hour", time.currentHour);

export default router;
