import handlers from "@/handlers";
import { authorized, authorizer } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", handlers.tutor.create);
router.get("/list", authorized, handlers.tutor.list);
router.get("/:id", authorized, handlers.tutor.get);
router.put(
  "/:id",
  authorizer().tutor().staff().handler(),
  handlers.tutor.update
);
router.delete(
  "/:id",
  authorizer().tutor().staff().handler(),
  handlers.tutor.delete
);

export default router;
