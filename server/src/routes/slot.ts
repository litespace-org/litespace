import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(handlers.slot.create)
  .put(handlers.slot.update)
  .get(handlers.slot.get);

router.get("/me", handlers.slot.list);

router.get("/list/discrete", handlers.slot.getDiscreteTimeSlots);

router
  .route("/:id")
  .get(handlers.slot.get)
  .delete(handlers.slot.delete)
  .put(handlers.slot.update);

export default router;
