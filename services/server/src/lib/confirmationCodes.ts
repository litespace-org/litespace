import { confirmationCodes } from "@litespace/models";
import { IConfirmationCode, IKafka, IUser } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { producer } from "@/lib/kafka";

// Generate code from 1000 to 9999
export function generateConfirmationCode(): number {
  return Math.floor(Math.random() * 8999) + 1000;
}

export function getPurpose(method?: IUser.NotificationMethod) {
  if (method === IUser.NotificationMethod.Whatsapp)
    return IConfirmationCode.Purpose.VerifyWhatsApp;
  if (method === IUser.NotificationMethod.Telegram)
    return IConfirmationCode.Purpose.VerifyTelegram;
  return null;
}

export async function sendCodeToUser({
  to,
  id,
  method,
}: {
  to: string;
  id: number;
  method: IKafka.TopicType;
}) {
  const code = await confirmationCodes.create({
    userId: id,
    purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
    code: generateConfirmationCode(),
    expiresAt: dayjs.utc().add(15, "m").toISOString(),
  });

  await producer.send({
    topic: method,
    messages: [
      {
        value: {
          to,
          message: `
  Hello From Litespace! Your verification code is ${code.code}.
  This code is valid for 15 minutes since the message has been sent. 
  If you did not request this code, please ignore this message.
  `,
        },
      },
    ],
  });
}
