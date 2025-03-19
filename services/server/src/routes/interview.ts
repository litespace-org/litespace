import { Router } from "express";
import interview from "@/handlers/interview";

const router = Router();

router.post("/", interview.createInterview);
router.get("/list", interview.findInterviews);
router.get("/full-list", interview.findFullInterviews);
router.get("/:interviewId", interview.findInterviewById);
router.put("/:interviewId", interview.updateInterview);

export default router;
