import dayjs from "@/lib/dayjs";
import { config } from "@/lib/config";
import { TelegramBot } from "@litespace/radio";
import { safePromise } from "@litespace/utils";

export const telegramBot = new TelegramBot(config.telegram.token);

export async function msg(job: "main" | "lesson", text: string) {
  const result = await safePromise(
    telegramBot.sendMessage({
      chat: config.telegram.chat,
      text: `[jobs/${config.env}/${job}]: ${text}\n\n${dayjs().toISOString()}`,
      parseMode: "text",
    })
  );

  if (result instanceof Error)
    console.error("Failed to send message using telegram bot.");
}
