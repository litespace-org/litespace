import handlers from "@/handlers";
import { ensureAuth, tutorOnly } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.route("/token").post(tutorOnly, handlers.zoom.setZoomRefreshToken);

router.post("/account", ensureAuth, handlers.zoomAccount.create);
router.get("/account/list", ensureAuth, handlers.zoomAccount.findAll);
router.get("/account/:id", ensureAuth, handlers.zoomAccount.findById);
router.put("/account/:id", ensureAuth, handlers.zoomAccount.update);
router.delete("/account/:id", ensureAuth, handlers.zoomAccount.delete);

export default router;
