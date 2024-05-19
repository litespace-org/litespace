import handlers from "@/handlers";
import { tutorOnly } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.route("/token").post(tutorOnly, handlers.zoom.setZoomRefreshToken);

export default router;
