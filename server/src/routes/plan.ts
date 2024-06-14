import handlers from "@/handlers";
import { superAdmin } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", superAdmin, handlers.plan.create);
router.get("/list", handlers.plan.findAll);
router.get("/:id", handlers.plan.findById);
router.put("/:id", superAdmin, handlers.plan.update);
router.delete("/:id", superAdmin, handlers.plan.delete);

export default router;
