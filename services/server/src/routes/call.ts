import { Router } from "express";
import call from "@/handlers/call";

const router = Router();

router.get("/:callId", call.findCallById);
router.get("/list/user/:userId", call.findCallsByUserId);

export default router;
