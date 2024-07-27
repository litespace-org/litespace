import handlers from "@/handlers";
import { Router } from "express";

const router = Router();

router
  .route("/")
  .post(handlers.rating.create)
  .put(handlers.rating.update)
  .get(handlers.rating.get)
  .delete(handlers.rating.delete);

export default router;
