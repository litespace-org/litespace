import { Router } from "express";
import interview from "@/handlers/interview";

const router = Router();

router.post("/", interview.createInterview);
router.get("/list/:userId", interview.findInterviews);
router.put("/:interviewId", interview.updateInterview);

export default router;
