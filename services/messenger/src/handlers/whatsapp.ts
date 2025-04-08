import { msg } from "@/lib/bot";
import { sendWhatsAppMessage } from "@/services/whatsapp";
import { WhatsApp } from "@litespace/radio";
import { Request, Response } from "express";
import safe from "express-async-handler";
import zod from "zod";

// todo: define types in types/src/whatsapp
const sendMessagePayload = zod.object({
  phone: zod.string(),
  text: zod.string(),
});

function sendMessage(whatsapp: WhatsApp) {
  return safe(async (req: Request, res: Response) => {
    const { phone, text } = sendMessagePayload.parse(req.body);

    try {
      await sendWhatsAppMessage(whatsapp, phone, text);
      res.sendStatus(200);
    } catch (err) {
      if (err instanceof Error)
        await msg("WhatsApp handler error: " + err.message);
      else await msg("WhatsApp handler error: Unknown");

      res.sendStatus(425);
    }
  });
}

export default {
  sendMessage,
};
