import { Router } from "express";
import auth from "@/handlers/auth";

const router = Router();

router.post("/password", auth.loginWithPassword);
router.post("/google", auth.loginWithGoogle);
router.post("/password/forgot", auth.forgotPassword);
router.put("/password/reset", auth.resetPassword);
router.put("/verify-email", auth.verifyEmail);

export default router;
