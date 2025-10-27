import plan from "@/handlers/plan";
import { Router } from "express";

const router = Router();

router.get("/list", plan.find);
router.get("/:id", plan.findById);
router.post("/", plan.create);
router.post("/checkout", plan.checkout);
router.patch("/:id", plan.update);
router.delete("/:id", plan.delete);

export default router;
