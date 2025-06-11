import { config } from "@/lib/config";
import { TelegramBot } from "@litespace/radio";
import { safePromise } from "@litespace/utils";

export const telegramBot = new TelegramBot(config.telegram.token);

export async function msg(job: "main" | "lesson" | "keepAlive", text: string) {
  const message = `[jobs/${config.env}/${job}]: ${text}`;
  console.log(message);

  const result = await safePromise(
    telegramBot.sendMessage({
      chat: config.telegram.chat,
      text: message,
      parseMode: "text",
    })
  );

  if (result instanceof Error)
    console.error("Failed to send message using telegram bot.");
}
