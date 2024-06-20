import { authorized, authorizer, staff } from "@/middleware/auth";
import { Request, Router } from "express";
import reply from "@/handlers/reportReplies";
import { reportReplies, reports } from "@/models";
import { identityObject } from "@/validation/utils";
import { notfound } from "@/lib/error";
import { IReport, IReportReply } from "@litespace/types";
import { ReportReplies } from "@/models/reportReplies";
import { Reports } from "@/models/reports";

const router = Router();

const replyAuth = authorizer()
  .staff()
  .simpleOwner<IReportReply.MappedAttributes, ReportReplies>(
    reportReplies,
    (reply) => reply.createdBy.id
  )
  .handler();

const reportAuth = authorizer()
  .staff()
  .simpleOwner<IReport.MappedAttributes, Reports>(
    reports,
    (report) => report.createdBy.id
  )
  .handler();

router.post("/", authorized, reply.create);
router.get("/list", staff, reply.findAll);
router.get("/:id", replyAuth, reply.findById);
router.get("/report/:id", reportAuth, reply.findByReportId);
router.put("/:id", replyAuth, reply.update);
router.delete("/:id", staff, reply.delete);

export default router;
