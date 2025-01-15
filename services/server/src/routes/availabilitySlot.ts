import { Router } from "express";
import availabilitySlot from "@/handlers/availabilitySlot";

const router = Router();

router.get("/", availabilitySlot.find);
router.post("/", availabilitySlot.set);

export default router;
