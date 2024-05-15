import handlers from "@/handlers";
import { Router } from "express";
import auth from "@/middleware/auth";

const router = Router();

router
  .route("/")
  .post(handlers.user.create)
  .put(auth(), handlers.user.update)
  .delete(auth(), handlers.user.delete)
  .get(auth(), handlers.user.get);

export default router;
