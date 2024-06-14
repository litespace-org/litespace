import handlers from "@/handlers";
import { authorized } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", authorized, handlers.call.create);
router.get("/list", authorized, handlers.call.list);
router.delete("/:id", authorized, handlers.call.delete);
router.get("/:id", authorized, handlers.call.get);
router.get("/host/:id", authorized, handlers.call.findHostCallById);
router.get("/host/:id/list", authorized, handlers.call.findHostCalls);

export default router;
