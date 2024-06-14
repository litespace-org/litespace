import handlers from "@/handlers";
import { student, authorizer } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(student, handlers.rating.create)
  .put(student, handlers.rating.update)
  .get(handlers.rating.get)
  .delete(authorizer().student().admins().handler(), handlers.rating.delete);

export default router;
