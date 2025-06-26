import { Router } from "express";
import introVideo from "@/handlers/introVideo";

const router = Router();

router.get("/list", introVideo.find);

export default router;
