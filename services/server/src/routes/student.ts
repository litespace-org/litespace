import student from "@/handlers/student";
import { Router } from "express";

const router = Router();

router.post("/", student.create);
router.put("/:id", student.update);

export default router;
