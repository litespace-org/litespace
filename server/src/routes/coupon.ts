import { admins, authorized, staff } from "@/middleware/auth";
import { Router } from "express";
import coupon from "@/handlers/coupon";

const router = Router();

router.post("/", admins, coupon.create);
router.get("/list", staff, coupon.findAll);
router.get("/code/:code", authorized, coupon.findByCode);
router.get("/:id", authorized, coupon.findById);
router.put("/:id", admins, coupon.update);
router.delete("/:id", admins, coupon.delete);

export default router;
