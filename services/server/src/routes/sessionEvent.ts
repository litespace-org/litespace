import { Router } from "express";
import sessionEvent from "@/handlers/sessionEvent";

const router = Router();

router.get("/list", sessionEvent.find);
router.get("/list/session/:sessionId", sessionEvent.findBySessionId);

export default router;
