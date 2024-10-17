import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router.post("/", handlers.plan.create);
router.get("/list", handlers.plan.find);
router.get("/:id", handlers.plan.findById);
router.put("/:id", handlers.plan.update);
router.delete("/:id", handlers.plan.delete);

export default router;
