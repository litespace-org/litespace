import { Router } from "express";
import session from "@/handlers/session";

const router = Router();

router.get("/token", session.getSessionToken);
router.get("/:sessionId", session.findSessionMembers);

export default router;
