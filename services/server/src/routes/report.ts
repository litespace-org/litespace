import report from "@/handlers/report";
import { Router } from "express";

const router = Router();

router.get("/list", report.find);
router.post("/", report.create);
router.put("/:id", report.update);

export default router;
