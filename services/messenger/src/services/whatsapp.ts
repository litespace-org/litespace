import { WhatsApp } from "@litespace/radio";

export async function sendWhatsAppMessage(
  client: WhatsApp,
  phone: string,
  text: string
) {
  if (client.connection !== "open") {
    throw new Error("WhatsApp is not ready to send messages");
  }

  const id = client.asWhatsAppId(phone);
  await client.sendMessage(id, { text });
}
