import { Router } from "express";
import call from "@/handlers/call";

const router = Router();

router.get("/:callId", call.findCallById);
router.get("/:callId/:callType/members", call.findCallMembers);

export default router;
