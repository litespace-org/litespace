import { config } from "@/lib/config";
import { TelegramBot } from "@litespace/radio";

export const telegramBot = new TelegramBot(config.telegram.bot.token);

export const msg = async (text: string) =>
  await telegramBot.sendMessage({
    chat: config.telegram.bot.chat,
    text: `[messenger/${config.environment}]: ${text}`,
    parseMode: "text",
  });
