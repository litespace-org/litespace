import { env } from "@/config";
import { TelegramBot } from "@litespace/radio";

export const telegramBot = new TelegramBot(env.telegram.bot.token);
