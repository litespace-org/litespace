import { Router } from "express";
import analytics from "@/handlers/analytics";

const router = Router();

router.post("/track-facebook-conversion", analytics.trackFacebookEvents);

export default router;
