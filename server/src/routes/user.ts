import handlers from "@/handlers";
import { Router } from "express";
import auth from "@/middleware/auth";
import { User } from "@/database";

const router = Router();

router
  .route("/")
  .post(handlers.user.create)
  .put(auth(), handlers.user.update)
  .delete(auth(), handlers.user.delete)
  .get(auth(), handlers.user.getOne);

router.get(
  "/list",
  auth([User.Type.SuperAdmin, User.Type.RegularAdmin]),
  handlers.user.getMany
);

router.post("/login", handlers.user.login);

export default router;
