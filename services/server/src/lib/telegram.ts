import { TelegramBot } from "@litespace/radio/telegram/bot";
import { environment, telegramConfig } from "@/constants";

export const telegram = new TelegramBot(telegramConfig.token);

export const msg = async (text: string) =>
  await telegram.sendMessage({
    chat: telegramConfig.chat,
    text: `[api/${environment}]: ${text}`,
    parseMode: "text",
  });

export const doc = async ({
  content,
  caption,
  name,
}: {
  content: string;
  caption?: string;
  name?: string;
}) =>
  await telegram.sendDocument({
    chat: telegramConfig.chat,
    caption: `[api/${environment}]: ${caption}`,
    document: Buffer.from(content, "utf-8"),
    name,
  });
