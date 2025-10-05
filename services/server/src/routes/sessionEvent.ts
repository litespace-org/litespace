import { Router } from "express";
import sessionEvent from "@/handlers/sessionEvent";

const router = Router();

router.get("/list", sessionEvent.find);

export default router;
