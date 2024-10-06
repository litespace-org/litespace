import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router.route("/").post(handlers.student.create);

export default router;
