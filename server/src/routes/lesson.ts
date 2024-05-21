import handlers from "@/handlers";
import { studentOnly } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.route("/").post(studentOnly, handlers.lesson.create);

export default router;
