import chat from "@/handlers/chat";
import { Router } from "express";

const router = Router();

router.post("/:userId", chat.createRoom);
router.get("/list/rooms/:userId", chat.findUserRooms);
router.get("/list/:roomId/messages", chat.findRoomMessages);
router.get("/room/by/members/", chat.findRoomByMembers);
router.get("/room/members/:roomId", chat.findRoomMembers);
router.put("/room/:roomId", chat.updateRoom);

export default router;
