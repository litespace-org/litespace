import { Router } from "express";
import messenger from "@/handlers/confirmationCode";

const router = Router();

router.post("/phone/send", messenger.sendVerifyPhoneCode);
router.post("/phone/verify", messenger.verifyPhoneCode);

export default router;
