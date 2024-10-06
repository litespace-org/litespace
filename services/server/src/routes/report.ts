import { Router } from "express";
import report from "@/handlers/report";

const router = Router();

router.post("/", report.create);
router.get("/list", report.findAll);
router.get("/:id", report.findById);
router.put("/:id", report.update);
router.delete("/:id", report.delete);

export default router;
