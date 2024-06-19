import { authorized, authorizer, staff } from "@/middleware/auth";
import { Request, Router } from "express";
import reply from "@/handlers/reportReplies";
import { reportReplies } from "@/models";
import { identityObject } from "@/validation/utils";
import { notfound } from "@/lib/error";

const router = Router();

const auth = authorizer()
  .staff()
  .owner(async (req: Request) => {
    const { id } = identityObject.parse(req.params);
    const report = await reportReplies.findById(id);
    if (!report) throw notfound();
    return report.createdBy.id;
  })
  .handler();

router.post("/", authorized, reply.create);
router.get("/list", staff, reply.findAll);
router.get("/:id", auth, reply.findById);
router.put("/:id", auth, reply.update);
router.delete("/:id", staff, reply.delete);

export default router;
