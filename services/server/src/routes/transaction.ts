import { Router } from "express";
import transaction from "@/handlers/transaction";

const router = Router();

router.get("/last", transaction.findLast);
router.get("/list", transaction.find);
router.get("/refund/:id", transaction.findRefundableAmount);
router.get("/:id", transaction.findById);

export default router;
