import handlers from "@/handlers";
import { studentOnly, studentOrAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(studentOnly, handlers.rating.create)
  .put(studentOnly, handlers.rating.update)
  .get(handlers.rating.get)
  .delete(studentOrAdmin, handlers.rating.delete);

export default router;
