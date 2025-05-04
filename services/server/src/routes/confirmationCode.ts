import { Router } from "express";
import messenger from "@/handlers/confirmationCode";

const router = Router();

router.post("/phone/send", messenger.sendVerifyPhoneCode);
router.post("/phone/verify", messenger.verifyPhoneCode);

router.post("/password/send", messenger.sendForgetPasswordCode);
router.post("/password/confirm", messenger.confirmForgetPasswordCode);

router.post("/email/send", messenger.sendEmailConfirmationCode);
router.post("/email/confirm", messenger.confirmEmailByCode);

export default router;
