import { Router } from "express";
import interview from "@/handlers/interview";

const router = Router();

router.post("/", interview.create);
router.patch("/", interview.update);
router.get("/list", interview.find);
router.get("/select", interview.selectInterviewer);

export default router;
