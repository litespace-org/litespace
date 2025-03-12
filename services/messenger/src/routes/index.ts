import whatsapp from "@/handlers/whatsapp";
import telegram from "@/handlers/telegram";
import { Router } from "express";
import { TelegramClient, WhatsApp } from "@litespace/radio";

export default function router(context: {
  whatsapp: WhatsApp;
  telegram: TelegramClient;
}) {
  const router = Router();

  router.post("/whatsapp/msg", whatsapp.sendMessage(context.whatsapp));
  router.post("/telegram/msg", telegram.sendMessage(context.telegram));

  return router;
}
