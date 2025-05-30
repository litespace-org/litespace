import { ApiContext } from "@/types/api";
import { Router } from "express";
import { uploadMiddleware } from "@/lib/assets";
import invoice from "@/handlers/invoice";

export default function router(context: ApiContext) {
  const router = Router();

  router.post("/", invoice.create);
  router.put("/receiver/:invoiceId", invoice.updateByReceiver(context));
  router.put(
    "/admin/:invoiceId",
    uploadMiddleware.single("receipt"),
    invoice.updateByAdmin(context)
  );
  router.get("/stats/:tutorId", invoice.stats);
  router.get("/list", invoice.find);
  router.delete("/:id", invoice.cancel);

  return router;
}
