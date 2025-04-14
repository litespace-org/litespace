import { TelegramBot } from "@litespace/radio/telegram/bot";
import { config } from "@/config";

export const telegram = new TelegramBot(config.telegram.token);
