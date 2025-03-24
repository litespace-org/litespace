import { msg } from "@/lib/bot";
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
    if (whatsapp.connection !== "open") {
      await msg("WhatsApp is not ready to send messages");
      res.sendStatus(425);
      return;
    }

    const { phone, text } = sendMessagePayload.parse(req.body);
    await whatsapp.sendMessage(whatsapp.asWhatsAppId(phone), { text });
    res.sendStatus(200);
  });
}

export default {
  sendMessage,
};
