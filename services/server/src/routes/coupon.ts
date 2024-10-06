import { Router } from "express";
import coupon from "@/handlers/coupon";

const router = Router();

router.post("/", coupon.create);
router.get("/list", coupon.findAll);
router.get("/code/:code", coupon.findByCode);
router.get("/:id", coupon.findById);
router.put("/:id", coupon.update);
router.delete("/:id", coupon.delete);

export default router;
