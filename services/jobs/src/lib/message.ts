import { IKafka } from "@litespace/types";
import { msg as base } from "@/lib/bot";
import { producer } from "@/lib/kafka";
import { isEmpty } from "lodash";

export async function msg(text: string) {
  return base("lesson", text);
}

export async function send<T extends IKafka.TopicType>(
  topic: T,
  messages: IKafka.ValueOf<T>[]
) {
  if (isEmpty(messages)) return;
  await producer.send({
    topic,
    messages: messages.map((message) => ({ value: message })),
  });
}
