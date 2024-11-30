import { Router } from "express";
import call from "@/handlers/call";

const router = Router();

router.get("/:callId", call.findCallById);

export default router;
