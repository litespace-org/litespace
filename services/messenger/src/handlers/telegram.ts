import { env } from "@/config";
import { telegramBot } from "@/lib/bot";
import { TelegramClient } from "@litespace/radio";
import { Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";

const sendMessagePayload = zod.object({
  entity: zod.string(),
  message: zod.string(),
});

function sendMessage(telegramClient: TelegramClient) {
  return safe(async (req: Request, res: Response) => {
    if (!telegramClient.client.connected) {
      await telegramBot.sendMessage({
        chat: env.telegram.bot.chat,
        text: "Telegram client is not ready to send messages",
      });
      res.sendStatus(425);
      return;
    }

    const { entity, message } = sendMessagePayload.parse(req.body);
    await telegramClient.sendMessage(entity, { message });
    res.sendStatus(200);
  });
}

export default {
  sendMessage,
};
