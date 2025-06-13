import image from "@/handlers/image";
import { ApiContext } from "@/types/api";
import { Router } from "express";

export default function router(context: ApiContext) {
  const router = Router();
  router.get("/", image.find(context));
  return router;
}
