import { TelegramBot } from "@litespace/radio";
import { config } from "@/lib/config";

export const telegram = new TelegramBot(config.telegram.token);

export async function msg(text: string) {
  return await telegram.sendMessage({
    chat: config.telegram.chat,
    text: `\\[recorder/${config.env}]: ${text}`,
  });
}
