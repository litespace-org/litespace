import rating from "@/handlers/rating";
import { Router } from "express";

const router = Router();

router.post("/", rating.createRating);
router.get("/list/rater/:id", rating.getRaterRatings);
router.get("/list", rating.getRatings);
router.get("/list/ratee/:id", rating.getRateeRatings);
router.get("/:id", rating.getRatingById);
router.put("/:id", rating.updateRating);
router.delete("/:id", rating.deleteRating);

export default router;
