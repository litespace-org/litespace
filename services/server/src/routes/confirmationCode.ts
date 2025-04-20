import { Router } from "express";
import messenger from "@/handlers/confirmationCode";

const router = Router();

router.post("/notification/send", messenger.sendVerifyNotificationMethodCode);
router.post("/notification/verify", messenger.verifyNotificationMethodCode);

export default router;
