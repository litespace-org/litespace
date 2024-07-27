import { Router } from "express";
import invite from "@/handlers/invite";

const router = Router();

router.post("/", invite.create);
router.get("/list", invite.findAll);
router.get("/:id", invite.findById);
router.put("/:id", invite.update);
router.delete("/:id", invite.delete);

export default router;
