import handlers from "@/handlers";
import { studentOnly, studentOrAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(studentOnly, handlers.ratings.create)
  .put(studentOnly, handlers.ratings.update)
  .delete(studentOrAdmin, handlers.ratings.delete);

export default router;
