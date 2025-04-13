import { Router } from "express";
import fawry from "@/handlers/fawry";

const router = Router();

router.post("/add-card/:userId", fawry.addCard);

export default router;
