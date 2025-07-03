import { Router } from "express";
import handlers from "@/handlers/demoSession";

const router = Router();

router.get("/list", handlers.find);
router.post("/", handlers.create);
router.patch("/", handlers.update);

export default router;
