import { Router } from "express";
import reply from "@/handlers/reportReplies";
import { reportReplies, reports } from "@/models";
import { IReport, IReportReply } from "@litespace/types";
import { ReportReplies } from "@/models/reportReplies";
import { Reports } from "@/models/reports";

const router = Router();

router.post("/", reply.create);
router.get("/list", reply.findAll);
router.get("/:id", reply.findById);
router.get("/report/:id", reply.findByReportId);
router.put("/:id", reply.update);
router.delete("/:id", reply.delete);

export default router;
