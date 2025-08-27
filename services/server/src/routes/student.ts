import student from "@/handlers/student";
import { Router } from "express";

const router = Router();

router.post("/", student.create);
router.patch("/", student.update);
router.get("/list", student.find);

export default router;
