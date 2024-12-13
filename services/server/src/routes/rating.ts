import rating from "@/handlers/rating";
import { Router } from "express";

const router = Router();

router.post("/", rating.createRating);
router.get("/list/rater/:id", rating.findRaterRatings);
router.get("/list", rating.findRatings);
router.get("/list/ratee/:id", rating.findRateeRatings);
router.get("/list/tutor/:id", rating.findTutorRatings);
router.get("/:id", rating.findRatingById);
router.put("/:id", rating.updateRating);
router.delete("/:id", rating.deleteRating);

export default router;
