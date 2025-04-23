import { Router } from "express";
import messenger from "@/handlers/confirmationCode";

const router = Router();

router.post("/phone/send", messenger.sendVerifyPhoneCode);
router.post("/phone/verify", messenger.verifyPhoneCode);

router.post("/password/send", messenger.sendForgottenPasswordCode);
router.post("/password/confirm", messenger.confirmForgottenPasswordCode);

router.post("/email/send", messenger.sendEmailVerificationCode);
router.post("/email/confirm", messenger.confirmEmailVerificationCode);

export default router;
