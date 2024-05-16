import { User } from "@/database";
import handlers from "@/handlers";
import auth from "@/middleware/auth";
import { Router } from "express";

const router = Router();

const tutorOnly = auth([User.Type.Tutor]);
const tutorOrAdmin = auth([
  User.Type.Tutor,
  User.Type.SuperAdmin,
  User.Type.RegularAdmin,
]);

router
  .route("/")
  .post(tutorOnly, handlers.slot.create)
  .put(tutorOnly, handlers.slot.update)
  .get(tutorOrAdmin, handlers.slot.get)
  .delete(tutorOnly, handlers.slot.delete);

router.get("/list", tutorOrAdmin, handlers.slot.list);

export default router;
