import handlers from "@/handlers";
import { Router } from "express";
import { adminOnly, authorized, ensureAuth } from "@/middleware/auth";

const router = Router();

router
  .route("/")
  .post(handlers.user.create)
  .put(ensureAuth, handlers.user.update)
  .delete(authorized, handlers.user.delete);

router.get("/me", ensureAuth, handlers.user.findMe);
router.get("/list", ensureAuth, handlers.user.getMany);
router.get("/:id", ensureAuth, handlers.user.findById);

export default router;
