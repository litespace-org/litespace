import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router.post("/", handlers.call.create);
router.get("/list", handlers.call.list);
router.delete("/:id", handlers.call.delete);
router.get("/:id", handlers.call.get);
router.get("/host/:id", handlers.call.findHostCallById);
router.get("/host/:id/list", handlers.call.findHostCalls);

export default router;
