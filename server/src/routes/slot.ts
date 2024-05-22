import { User } from "@/database";
import handlers from "@/handlers";
import { studentOrAdmin, tutorOnly, tutorOrAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(tutorOnly, handlers.slot.create)
  .put(tutorOnly, handlers.slot.update)
  .get(tutorOrAdmin, handlers.slot.get)
  .delete(tutorOnly, handlers.slot.delete);

router.get("/list", tutorOrAdmin, handlers.slot.list);

router.get(
  "/list/discrete",
  // studentOrAdmin,
  handlers.slot.getDiscreteTimeSlots
);

export default router;
