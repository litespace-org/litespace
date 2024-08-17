import tutor from "@/handlers/tutor";
import { Router } from "express";

const router = Router();

router.post("/", tutor.create);
router.get("/list", tutor.list);
router.get("/:id", tutor.findById);
router.put("/:id", tutor.update);
router.delete("/:id", tutor.delete);
router.get("/media/list", tutor.findTutorsMedia);
router.get("/media/:id", tutor.findTutorMediaById);

export default router;
