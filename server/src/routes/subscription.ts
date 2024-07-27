import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(handlers.subscription.create)
  .put(handlers.subscription.update)
  .delete(handlers.subscription.delete)
  .get(handlers.subscription.getStudentSubscription);

router.get("/list", handlers.subscription.getList);

export default router;
