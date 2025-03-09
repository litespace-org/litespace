import { TelegramBot } from "@litespace/radio/telegram/bot";
import { telegramConfig } from "@/constants";

export const telegram = new TelegramBot(telegramConfig.token);
