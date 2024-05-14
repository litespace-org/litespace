import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router.post("/", handlers.user.create);
router.put("/", handlers.user.update);
router.delete("/", handlers.user.delete);
router.get("/", handlers.user.get);

export default router;
