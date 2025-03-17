import { Router } from "express";
import analytics from "@/handlers/analytics";

const router = Router();

router.post("/fb/track", analytics.trackFacebookEvents);

export default router;
