import { Router } from "express";
import withdrawMethod from "@/handlers/withdrawMethod";

const router = Router();

router.post("/", withdrawMethod.create);
router.put("/:type", withdrawMethod.update);
router.get("/list", withdrawMethod.find);

export default router;
