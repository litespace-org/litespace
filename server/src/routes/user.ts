import user from "@/handlers/user";
import { Router } from "express";
import { authorized, staff } from "@/middleware/auth";

const router = Router();

router.route("/").post(user.create).delete(authorized, user.delete);

router.get("/me", authorized, user.findMe);
router.get("/list", staff, user.getMany);
router.get("/:id", staff, user.findById);
router.put("/:id", authorized, user.update);

export default router;
