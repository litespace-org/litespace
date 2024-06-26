import user from "@/handlers/user";
import { Router } from "express";
import { authorized, staff } from "@/middleware/auth";

const router = Router();

router
  .route("/")
  .post(user.create)
  .put(authorized, user.update)
  .delete(authorized, user.delete);

router.get("/me", authorized, user.findMe);
router.get("/list", staff, user.getMany);
router.get("/:id", staff, user.findById);

export default router;
