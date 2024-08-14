import chat from "@/handlers/chat";
import { Router } from "express";

const router = Router();

router.post("/:userId", chat.createRoom);
router.get("/list/rooms/:userId", chat.findUserRooms);
router.get("/list/:roomId/messages", chat.findRoomMessages);

export default router;
