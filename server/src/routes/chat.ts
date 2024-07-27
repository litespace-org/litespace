import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router.route("/").post(handlers.chat.create).get(handlers.chat.findByUserId);

export default router;
