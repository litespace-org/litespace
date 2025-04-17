import { Router } from "express";
import transaction from "@/handlers/transaction";

const router = Router();

router.get("/:id", transaction.findById);
router.get("/list", transaction.find);

export default router;
