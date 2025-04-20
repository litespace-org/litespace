import { TelegramClient } from "@litespace/radio";
import { config } from "@/lib/config";
import { msg } from "@/lib/bot";
import { Consumer } from "@litespace/kafka";
import ms from "ms";
import { safePromise } from "@litespace/utils";
import { isAxiosError } from "axios";
import { WhatsApp } from "@litespace/radio";
import express, { json } from "express";
import routes from "@/routes";
import { PORT } from "@/lib/constants";
import { errorHandler } from "@/middleware/error";
import auth from "@/middleware/auth";

// Global error handling. This is needed to prevent the server process from
// exit.
process.on("uncaughtException", async (error) => {
  console.log("Uncaught exception");
  console.error(error);
  try {
    await msg(`uncaught exception: ${error.message}`);
  } catch (error) {
    console.log(
      `Failed to notify the exception: `,
      isAxiosError(error) ? error.response : error
    );
  }
});

const app = express();

async function main() {
  // ============================ Telegram Setup ================================
  const telegram = new TelegramClient({
    api: {
      id: config.telegram.client.id,
      hash: config.telegram.client.hash,
    },
  });
  await telegram.start();

  const telegramConsumer = new Consumer<"telegram">("telegram");
  await telegramConsumer.connect();
  await telegramConsumer.subscribe({
    topics: ["telegram"],
    fromBeginning: true,
  });

  // ============================ Whatsapp Setup ================================
  const whatsapp = new WhatsApp();
  await whatsapp.withStore("file");

  // Acquire whatsapp credentials
  whatsapp.connect();
  await whatsapp.wait(ms("5m"));

  const whatsappConsumer = new Consumer<"whatsapp">("whatsapp");
  await whatsappConsumer.connect();
  await whatsappConsumer.subscribe({
    topics: ["whatsapp"],
    fromBeginning: true,
  });

  // ============================ Setup API ================================
  app.use(json());
  app.use(auth);
  app.use("/api/v1/telegram", routes.telegram(telegram));
  app.use(errorHandler);
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

  // ============================ Consumer WhatsApp & Telegram Topics ================================
  await whatsappConsumer.run({
    async eachMessage({ topic, value }) {
      if (!value) return;
      console.log(`[${topic}]: processing mesage`);
      const id = whatsapp.asWhatsAppId(value.to);
      const result = await safePromise(
        whatsapp.sendMessage(id, { text: value.message })
      );
      if (result instanceof Error)
        await msg(`failed to send the whatsapp message: ${result.message}`);
      whatsappConsumer.wait(["whatsapp"], ms("5s"));
    },
  });

  await telegramConsumer.run({
    async eachMessage({ topic, value }) {
      console.log(`[${topic}]: processing mesage`, value);
      if (!value) return;

      const phone = telegram.asPhoneNumber(value.to);
      const user = await safePromise(telegram.resolvePhone(phone));

      if (user instanceof Error || !user) {
        await msg("failed to resolve phone number");
        return;
      }

      const result = await safePromise(
        telegram.sendMessage(user.id, { message: value.message })
      );
      if (result instanceof Error)
        await msg(`failed to send telegram message: ${result.message}`);
      telegramConsumer.wait(["telegram"], ms("5s"));
    },
  });
}

main();
