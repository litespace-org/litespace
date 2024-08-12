import { Router } from "express";
import call from "@/handlers/call";

const router = Router();

router.post("/", call.create);
router.get("/list", call.list);
router.delete("/:id", call.delete);
router.get("/:id", call.get);
router.get("/host/:id", call.findHostCallById);
router.get("/host/:id/list", call.findHostCalls);
router.get("/tutor/interviews/:id", call.findTutorInterviews);

export default router;
