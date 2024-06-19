import { admins, authorized, staff } from "@/middleware/auth";
import { Router } from "express";
import invite from "@/handlers/invite";

const router = Router();

router.post("/", admins, invite.create);
router.get("/list", admins, invite.findAll);
router.get("/:id", admins, invite.findById);
router.put("/:id", admins, invite.update);
router.delete("/:id", admins, invite.delete);

export default router;
