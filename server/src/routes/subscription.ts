import handlers from "@/handlers";
import { adminOnly, studentOnly, studentOrAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(studentOnly, handlers.subscription.create)
  .put(studentOrAdmin, handlers.subscription.update)
  .delete(studentOrAdmin, handlers.subscription.delete)
  .get(studentOrAdmin, handlers.subscription.getStudentSubscription);

router.get("/list", adminOnly, handlers.subscription.getList);

export default router;
