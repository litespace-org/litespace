import handlers from "@/handlers";
import { Router } from "express";
import { adminOnly, authorized, ensureAuth } from "@/middleware/auth";

const router = Router();

router
  .route("/")
  .post(handlers.user.create)
  .put(authorized, handlers.user.update)
  .delete(authorized, handlers.user.delete)
  .get(authorized, handlers.user.getOne);

router.get("/me", ensureAuth, handlers.user.findMe);

router.get("/list", adminOnly, handlers.user.getMany);

router.post("/login", handlers.user.login);

export default router;
