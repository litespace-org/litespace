import handlers from "@/handlers";
import { authorizer } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", authorizer().superAdmin().handler(), handlers.plan.create);
router.get("/list", handlers.plan.findAll);
router.get("/:id", handlers.plan.findById);
router.put("/:id", authorizer().superAdmin().handler(), handlers.plan.update);
router.delete(
  "/:id",
  authorizer().superAdmin().handler(),
  handlers.plan.delete
);

export default router;
