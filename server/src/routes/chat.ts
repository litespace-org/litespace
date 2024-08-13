import chat from "@/handlers/chat";
import { Router } from "express";

const router = Router();

router.get("/list/:id/messages", chat.findRoomMessages);

export default router;
