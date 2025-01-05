import { Router } from "express";
import session from "@/handlers/session";

const router = Router();

router.get("/:sessionId", session.findSessionMembers);

export default router;
