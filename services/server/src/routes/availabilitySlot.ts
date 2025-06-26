import { Router } from "express";
import availabilitySlot from "@/handlers/availabilitySlot";
import { ApiRoutes } from "@litespace/utils/routes";

const router = Router();

const availabilitySlotRoutes = ApiRoutes.availabilitySlot.routes;

router.get(availabilitySlotRoutes.find, availabilitySlot.find);
router.post(availabilitySlotRoutes.set, availabilitySlot.set);

export default router;
