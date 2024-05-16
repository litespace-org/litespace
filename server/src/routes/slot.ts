import { User } from "@/database";
import handlers from "@/handlers";
import auth from "@/middleware/auth";
import { Router } from "express";

const router = Router();

const teacherOnly = auth([User.Type.Teacher]);
const teacherOrAdmin = auth([
  User.Type.Teacher,
  User.Type.SuperAdmin,
  User.Type.RegularAdmin,
]);

router
  .route("/")
  .post(teacherOnly, handlers.slot.create)
  .put(teacherOnly, handlers.slot.update)
  .get(teacherOrAdmin, handlers.slot.get)
  .delete(teacherOnly, handlers.slot.delete);

router.get("/list", teacherOrAdmin, handlers.slot.list);

export default router;
