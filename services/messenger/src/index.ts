import { TelegramClient, WhatsApp } from "@litespace/radio";
import { messengerAuthMiddleware } from "@litespace/auth";

import { env } from "@/config";
import express, { json } from "express";
import router from "@/routes";

const app = express();

async function main() {
  const telegram = new TelegramClient({
    api: {
      id: env.telegram.client.id,
      hash: env.telegram.client.hash,
    },
  });

  // Acquire telegram credentials
  await telegram.start();

  const whatsapp = new WhatsApp();
  await whatsapp.withStore("file");
  whatsapp.connect();

  app.use(json());
  app.use(
    messengerAuthMiddleware({
      username: env.credentials.username,
      password: env.credentials.password,
    })
  );
  app.use("/api/v1/", router({ whatsapp, telegram }));
  app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
