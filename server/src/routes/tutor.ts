import handlers from "@/handlers";
import { ensureAuth } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", handlers.tutor.create);
router.get("/list", ensureAuth, handlers.tutor.list);
router.get("/:id", ensureAuth, handlers.tutor.get);
router.put("/:id", ensureAuth, handlers.tutor.update);
router.delete("/:id", ensureAuth, handlers.tutor.delete);

export default router;
