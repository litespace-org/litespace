import { Router } from "express";
import auth from "@/handlers/auth";
import rateLimit from "express-rate-limit";
import ms from "ms";

const router = Router();

router.post("/password", auth.loginWithPassword);
router.post("/google", auth.loginWithGoogle);
router.post(
  "/refresh-token",
  rateLimit({ windowMs: ms("1M"), limit: 5 }),
  auth.refreshAuthToken
);

export default router;
