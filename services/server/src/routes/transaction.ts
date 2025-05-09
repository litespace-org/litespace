import { Router } from "express";
import transaction from "@/handlers/transaction";

const router = Router();

router.get("/pending", transaction.findPending);
router.get("/list", transaction.find);
router.get("/:id", transaction.findById);

export default router;
