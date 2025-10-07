import student from "@/handlers/student";
import { Router } from "express";

const router = Router();

router.get("/:id", student.findById);
router.get("/list", student.find);
router.post("/", student.create);
router.patch("/", student.update);

export default router;
