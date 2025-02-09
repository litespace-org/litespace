import { Telegram } from "@litespace/radio/telegram";
import { config } from "@/config";

export const telegram = new Telegram(config.telegram.token);
