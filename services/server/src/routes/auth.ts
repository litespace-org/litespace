import { Router } from "express";
import auth from "@/handlers/auth";

const router = Router();

router.post("/password", auth.loginWithPassword);
router.post("/google", auth.loginWithGoogle);
router.post("/password/foreget", auth.forgotPassword);
router.put("/password/reset", auth.forgotPassword);

export default router;
