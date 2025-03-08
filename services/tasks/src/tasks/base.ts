import { config } from "@/lib/config";
import { Telegram, WhatsApp } from "@litespace/radio";

export class BaseTask {
  constructor(
    public readonly telegram: Telegram,
    public readonly whatsapp: WhatsApp
  ) {}

  async sendTelegramMessage(text: string) {
    return await this.telegram.sendMessage({
      text,
      chat: config.telegram.chat,
    });
  }
}
