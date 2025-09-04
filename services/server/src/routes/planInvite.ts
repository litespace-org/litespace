import planInvite from "@/handlers/planInvite";
import { Router } from "express";

const router = Router();

router.get("/list", planInvite.find);
router.post("/", planInvite.create);
router.patch("/", planInvite.update);
router.delete("/:id", planInvite.delete);

export default router;
