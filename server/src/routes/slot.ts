import { User } from "@/database";
import handlers from "@/handlers";
import { tutorOnly, tutorOrAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(tutorOnly, handlers.slot.create)
  .put(tutorOnly, handlers.slot.update)
  .get(tutorOrAdmin, handlers.slot.get)
  .delete(tutorOnly, handlers.slot.delete);

router.get("/list", tutorOrAdmin, handlers.slot.list);

export default router;
