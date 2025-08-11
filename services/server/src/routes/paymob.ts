import { Router } from "express";
import paymob from "@/handlers/paymob";

const router = Router();

router.post("/create-checkout-url", paymob.createCheckoutUrl);
router.post("/on-checkout", paymob.onCheckout);

export default router;
