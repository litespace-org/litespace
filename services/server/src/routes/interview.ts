import { Router } from "express";
import interview from "@/handlers/interview";

const router = Router();

router.post("/", interview.create);
router.get("/list", interview.find);
router.patch("/", interview.update);

export default router;
