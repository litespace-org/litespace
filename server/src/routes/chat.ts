import handlers from "@/handlers";
import { studentOnly, studentOrTutor } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(studentOnly, handlers.chat.create)
  .get(studentOrTutor, handlers.chat.findByUserId);

export default router;
