import { Router } from "express";
import { password, google } from "@/handler";

export function router({
  clientId,
  jwtSecret,
}: {
  jwtSecret: string;
  clientId: string;
}) {
  const router = Router();
  router.post("/password", password(jwtSecret));
  router.post("/google", google({ clientId, jwtSecret }));
  return router;
}
