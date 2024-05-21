import handlers from "@/handlers";
import { authorized, studentOnly } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(studentOnly, handlers.lesson.create)
  .get(authorized, handlers.lesson.get)
  .delete(authorized, handlers.lesson.delete);

router.get("/list", authorized, handlers.lesson.list);

export default router;
