import handlers from "@/handlers";
import { Router } from "express";
import { authorized, staff } from "@/middleware/auth";

const router = Router();

router
  .route("/")
  .post(handlers.user.create)
  .put(authorized, handlers.user.update)
  .delete(authorized, handlers.user.delete);

router.get("/me", authorized, handlers.user.findMe);
router.get("/list", staff, handlers.user.getMany);
router.get("/:id", staff, handlers.user.findById);

export default router;
