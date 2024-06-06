import handlers from "@/handlers";
import { ensureAuth } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(ensureAuth, handlers.slot.create)
  .put(ensureAuth, handlers.slot.update)
  .get(ensureAuth, handlers.slot.get);

router.get("/list", ensureAuth, handlers.slot.list);

router.get("/list/discrete", ensureAuth, handlers.slot.getDiscreteTimeSlots);

router
  .route("/:id")
  .get(ensureAuth, handlers.slot.get)
  .delete(ensureAuth, handlers.slot.delete)
  .put(ensureAuth, handlers.slot.update);

export default router;
