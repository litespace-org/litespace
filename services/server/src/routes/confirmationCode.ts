import { Router } from "express";
import messenger from "@/handlers/confirmationCode";

const router = Router();

router.post("/send-verification-code", messenger.sendCode);
router.post("/verify", messenger.verifyCode);

export default router;
