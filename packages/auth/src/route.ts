import { Router } from "express";
import { password } from "@/handler";

export function router(secret: string) {
  const router = Router();
  router.post("/password", password(secret));
  return router;
}
