import { Router } from "express";
import fawry from "@/handlers/fawry";

const router = Router();

router.post("/pay/card", fawry.payWithCard);
router.post("/pay/ref-num", fawry.payWithRefNum);
router.post("/pay/e-wallet", fawry.payWithEWallet);
router.post("/pay/bank-installments", fawry.payWithBankInstallments);

router.post("/cancel-unpaid-order", fawry.cancelUnpaidOrder);
router.post("/refund", fawry.refund);

router.get("/card-token/url", fawry.getAddCardTokenUrl);
router.get("/card-token/list", fawry.listCardTokens);
router.delete("/card-token", fawry.deleteCardToken);

router.get("/payment-status", fawry.getPaymentStatus);

export default router;
