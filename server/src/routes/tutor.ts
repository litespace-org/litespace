import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router.post("/", handlers.tutor.create);
router.get("/list", handlers.tutor.list);
router.get("/:id", handlers.tutor.findById);
router.put("/:id", handlers.tutor.update);
router.delete("/:id", handlers.tutor.delete);
router.get("/media/list", handlers.tutor.getTutorsMedia);
router.get("/media/:id", handlers.tutor.getTutorMediaById);

export default router;
