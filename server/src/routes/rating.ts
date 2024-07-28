import rating from "@/handlers/rating";
import { Router } from "express";

const router = Router();

router.post("/", rating.create);
router.post("/media-provider", rating.rateMediaProvider);
router.get("/user/:id", rating.getUserRatings);
router.get("/:id", rating.getRatingById);
router.put("/:id", rating.update);
router.delete("/:id", rating.delete);

export default router;
