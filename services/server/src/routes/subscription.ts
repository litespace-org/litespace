import { Router } from "express";
import subscription from "@/handlers/subscription";

const router = Router();

router.get("/current", subscription.findCurrent);
router.get("/list", subscription.find);
router.get("/:id", subscription.findById);

export default router;
