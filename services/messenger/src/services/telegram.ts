import { TelegramClient } from "@litespace/radio";

export async function sendTelegramMessage(
  client: TelegramClient,
  entity: string,
  message: string
) {
  if (!client.client.connected) {
    throw new Error("Telegram client is not ready to send messages");
  }

  await client.sendMessage(entity, { message });
}
