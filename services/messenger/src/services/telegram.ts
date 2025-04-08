import { TelegramClient } from "@litespace/radio";

function asTelegramNumber(number: string) {
  return `+2${number}`;
}

export async function sendTelegramMessage(
  client: TelegramClient,
  number: string,
  message: string
) {
  if (!client.client.connected) {
    throw new Error("Telegram client is not ready to send messages");
  }

  const id = asTelegramNumber(number);
  await client.sendMessage(id, { message });
}
