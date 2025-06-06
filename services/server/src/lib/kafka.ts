import { Producer } from "@litespace/kafka";
import { IUser } from "@litespace/types";
import { NOTIFICATION_METHOD_TO_KAFKA_TOPIC } from "@litespace/utils/constants";

export const producer = new Producer();
producer.connect();

export async function sendNotificationMessage({
  method,
  message,
  phone,
}: {
  method: IUser.NotificationMethod;
  message: string;
  phone: string;
}) {
  await producer.send({
    topic: NOTIFICATION_METHOD_TO_KAFKA_TOPIC[method],
    messages: [
      {
        value: {
          message,
          to: phone,
        },
      },
    ],
  });
}
