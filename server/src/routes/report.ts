import { authorized, authorizer, staff } from "@/middleware/auth";
import { Request, Router } from "express";
import report from "@/handlers/report";
import { reports } from "@/models";
import { identityObject } from "@/validation/utils";
import { notfound } from "@/lib/error";

const router = Router();

const auth = authorizer()
  .staff()
  .owner(async (req: Request) => {
    const { id } = identityObject.parse(req.params);
    const report = await reports.findById(id);
    if (!report) throw notfound();
    return report.createdBy.id;
  })
  .handler();

router.post("/", authorized, report.create);
router.get("/list", staff, report.findAll);
router.get("/:id", auth, report.findById);
router.put("/:id", auth, report.update);
router.delete("/:id", staff, report.delete);

export default router;
