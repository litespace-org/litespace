import handlers from "@/handlers";
import { Router } from "express";
import { adminOnly, authorized } from "@/middleware/auth";
import { User } from "@/database";

const router = Router();

router
  .route("/")
  .put(authorized, handlers.user.update)
  .delete(authorized, handlers.user.delete)
  .get(authorized, handlers.user.getOne);

router.get("/list", adminOnly, handlers.user.getMany);

router.post("/login", handlers.user.login);

export default router;
