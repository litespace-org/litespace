import { TelegramClient, WhatsApp } from "@litespace/radio";
import { auth } from "@/middleware/auth";
import { config } from "@/config";
import express, { json } from "express";
import router from "@/routes";
import { errorHandler } from "@/middleware/error";
import { msg } from "@/lib/bot";

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

async function main() {
  const telegram = new TelegramClient({
    api: {
      id: config.telegram.client.id,
      hash: config.telegram.client.hash,
    },
  });

  // Acquire telegram credentials
  await telegram.start();

  const whatsapp = new WhatsApp();
  await whatsapp.withStore("file");
  whatsapp.connect();

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
