import { msg } from "@/lib/bot";
import { sendTelegramMessage } from "@/services/telegram";
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
      await msg("Telegram client is not ready to send messages");
      res.sendStatus(425);
      return;
    }

    const { entity, message } = sendMessagePayload.parse(req.body);

    try {
      await sendTelegramMessage(telegramClient, entity, message);
      res.sendStatus(200);
    } catch (err) {
      if (err instanceof Error)
        await msg("Telegram handler error: " + err.message);
      else await msg("Telegram handler error: Unknown");

      res.sendStatus(425);
    }
  });
}

export default {
  sendMessage,
};
