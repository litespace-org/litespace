import handlers from "@/handlers";
import { adminOnly, ensureAuth, tutorOrAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(handlers.tutor.create)
  .put(tutorOrAdmin, handlers.tutor.update)
  .delete(adminOnly, handlers.tutor.delete)
  .get(tutorOrAdmin, handlers.tutor.get);

router.get("/list", ensureAuth, handlers.tutor.list);

export default router;
