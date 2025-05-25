import { Router } from "express";
import subscription from "@/handlers/subscription";

const router = Router();

router.get("/user", subscription.findUserSubscription);
router.get("/list", subscription.find);
router.get("/:id", subscription.findById);

export default router;
