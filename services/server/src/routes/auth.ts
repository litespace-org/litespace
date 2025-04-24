import { Router } from "express";
import auth from "@/handlers/auth";
import rateLimit from "express-rate-limit";
import ms from "ms";

const router = Router();

router.post("/password", auth.loginWithPassword);
router.post("/google", auth.loginWithGoogle);
router.post("/password/forget", auth.forgetPassword);
router.post(
  "/refresh-token",
  rateLimit({ windowMs: ms("1m"), limit: 5 }),
  auth.refreshAuthToken
);
router.put("/password/reset", auth.resetPassword);
router.put("/verify-email", auth.verifyEmail);
router.put("/send-verify-email", auth.sendVerificationEmail);

export default router;
