import { config } from "@/lib/config";
import { TelegramBot } from "@litespace/radio";
import { safePromise } from "@litespace/utils";

export const telegramBot = new TelegramBot(config.telegram.bot.token);

export async function msg(text: string) {
  const result = await safePromise(
    telegramBot.sendMessage({
      chat: config.telegram.bot.chat,
      text: `[messenger/${config.environment}]: ${text}`,
      parseMode: "text",
    })
  );

  if (result instanceof Error)
    console.error("Failed to send message using telegram bot.");
}
