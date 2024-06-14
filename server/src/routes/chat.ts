import handlers from "@/handlers";
import { authorizer, student } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(student, handlers.chat.create)
  .get(authorizer().tutor().student().handler(), handlers.chat.findByUserId);

export default router;
