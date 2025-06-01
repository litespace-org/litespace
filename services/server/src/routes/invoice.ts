import { ApiContext } from "@/types/api";
import { Router } from "express";
import { uploadMiddleware } from "@/lib/assets";
import invoice from "@/handlers/invoice";
import { IInvoice } from "@litespace/types";

export default function router(context: ApiContext) {
  const router = Router();

  router.get("/", invoice.find);
  router.get("/stats/:tutorId", invoice.stats);

  router.post("/", invoice.create);

  router.put(
    "/:invoiceId",
    uploadMiddleware.single(IInvoice.ReceiptFileKey),
    invoice.update(context)
  );

  return router;
}
