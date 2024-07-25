import handlers from "@/handlers";
import { authorized, authorizer } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(authorizer().tutor().interviwer().handler(), handlers.slot.create)
  .put(authorizer().tutor().interviwer().handler(), handlers.slot.update)
  .get(authorizer().tutor().interviwer().handler(), handlers.slot.get);

router.get("/list", authorized, handlers.slot.list);

router.get("/list/discrete", authorized, handlers.slot.getDiscreteTimeSlots);

router
  .route("/:id")
  .get(authorized, handlers.slot.get)
  .delete(authorizer().tutor().staff().handler(), handlers.slot.delete)
  .put(authorizer().tutor().staff().handler(), handlers.slot.update);

export default router;
