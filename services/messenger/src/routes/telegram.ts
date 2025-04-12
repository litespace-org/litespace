import { TelegramClient } from "@litespace/radio";
import { Router } from "express";
import handlers from "@/handlers/telegram";

export default function router(telegram: TelegramClient) {
  const router = Router();
  router.post("/resolve-phone", handlers.resolvePhone(telegram));
  return router;
}
