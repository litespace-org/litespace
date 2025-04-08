import { TelegramClient, WhatsApp } from "@litespace/radio";
import { auth } from "@/middleware/auth";
import { config } from "@/config";
import express, { json } from "express";
import router from "@/routes";
import { errorHandler } from "@/middleware/error";
import { msg } from "@/lib/bot";
import { Consumer } from "@litespace/kafka";
import { sendWhatsAppMessage } from "@/services/whatsapp";
import { sendTelegramMessage } from "@/services/telegram";
import z from "zod";

// Global error handling. This is needed to prevent the server process from
// exit.
process.on("uncaughtException", async (error) => {
  console.log("Uncaught exception");
  console.error(error);
  try {
    await msg(`uncaught exception: ${error.message}`);
  } catch (error) {
    console.log(`Faield to notify the exception`, error);
  }
});

const app = express();

export const kafkaMessageSchema = z.object({
  to: z.string(),
  message: z.string(),
});

async function main() {
  const telegram = new TelegramClient({
    api: {
      id: config.telegram.client.id,
      hash: config.telegram.client.hash,
    },
  });
  // Acquire telegram credentials
  if (config.telegram.enabled) await telegram.start();

  const whatsapp = new WhatsApp();
  await whatsapp.withStore("file");

  // Acquire whatsapp credentials
  if (config.whatsapp.enabled) whatsapp.connect();

  const whatsappConsumer = new Consumer("whatsapp");

  await whatsappConsumer.connect();

  await whatsappConsumer.subscribe("whatsapp", async (data) => {
    try {
      const { to, message } = kafkaMessageSchema.parse(data);

      console.log({ to, message });

      await sendWhatsAppMessage(whatsapp, to, message);
    } catch (err) {
      console.error("Failed to send WhatsApp message", err);
      if (err instanceof Error)
        await msg("WhatsApp handler error: " + err.message);
      else await msg("WhatsApp handler error: Unknown");
    }
  });

  const telegramConsumer = new Consumer("telegram");

  await telegramConsumer.connect();

  await telegramConsumer.subscribe("telegram", async (data) => {
    try {
      const { to, message } = kafkaMessageSchema.parse(data);
      await sendTelegramMessage(telegram, to, message);
    } catch (err) {
      console.error("Failed to send Telegram message", err);
      if (err instanceof Error)
        await msg("Telegram handler error: " + err.message);
      else await msg("Telegram handler error: Unknown");
    }
  });

  app.use(json());
  app.use(
    auth({
      username: config.credentials.username,
      password: config.credentials.password,
    })
  );
  app.use("/api/v1/", router({ whatsapp, telegram }));
  app.use(errorHandler);

  app.listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  );
}

main();
