import { Router } from "express";
import session from "@/handlers/session";

const router = Router();

router.get("/:sessionId", session.findSessionById);
router.get("/:sessionId/members", session.findSessionMembers);

export default router;
