import user from "@/handlers/user";
import { Router } from "express";

const router = Router();

router.route("/").post(user.create).delete(user.delete);
router.get("/me", user.findMe);
router.get("/list", user.getMany);
router.get("/:id", user.findById);
router.put("/:id", user.update);

export default router;
