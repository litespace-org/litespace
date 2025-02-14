import { Telegram } from "@litespace/radio";
import { telegramConfig } from "@/constants";

export const telegram = new Telegram(telegramConfig.token);
