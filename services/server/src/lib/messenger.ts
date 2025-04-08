import { Producer } from "@litespace/kafka";

export async function sendLessonMessage({
  message,
  phone,
  enabledTelegram,
  enabledWhatsapp,
  verifiedPhone,
}: {
  phone: string | null;
  verifiedPhone: boolean;
  enabledWhatsapp: boolean;
  enabledTelegram: boolean;
  message: string;
}) {
  const producer = new Producer();
  await producer.connect();

  if (enabledWhatsapp && verifiedPhone && phone) {
    await producer.send({
      topic: "whatsapp",
      value: { to: phone, message },
    });
  }

  if (enabledTelegram && verifiedPhone && phone)
    await producer.send({
      topic: "telegram",
      value: {
        to: phone,
        message,
      },
    });

  await producer.disconnect();
}
