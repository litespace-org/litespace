import { Router } from "express";
import slot from "@/handlers/slot";

const router = Router();

router.post("/", slot.create);
router.put("/:id", slot.update);
router.get("/:id", slot.findById);
router.get("/list", slot.update);
router.get("/list/me", slot.findMySlots);
router.get("/list/user/:id", slot.findUserSlots);
router.get("/list/discrete/:userId", slot.findDiscreteTimeSlots);
router.delete("/:id", slot.delete);

export default router;
