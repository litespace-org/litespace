import handlers from "@/handlers";
import { ensureAuth } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", ensureAuth, handlers.call.create);
router.get("/list", ensureAuth, handlers.call.list);
router.delete("/:id", ensureAuth, handlers.call.delete);
router.get("/:id", ensureAuth, handlers.call.get);

export default router;
