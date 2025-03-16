import { TelegramBot } from "@litespace/radio/telegram/bot";
import { environment, telegramConfig } from "@/constants";

export const telegram = new TelegramBot(telegramConfig.token);

export const msg = async (text: string) =>
  await telegram.sendMessage({
    chat: telegramConfig.chat,
    text: `\\[api/${environment}]: ${text}`,
  });
