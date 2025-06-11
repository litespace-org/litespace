import { msg as base } from "@/lib/bot";
import { config } from "@/lib/config";
import { producer } from "@/lib/kafka";
import { IKafka } from "@litespace/types";
import { safePromise } from "@litespace/utils";

function msg(text: string) {
  return base("keepAlive", text);
}

async function start() {
  const value: IKafka.ValueOf<"whatsapp"> | IKafka.ValueOf<"telegram"> = {
    to: config.adminPhoneNumber,
    message: "Ping",
  };

  const topics: IKafka.TopicType[] = ["telegram", "whatsapp"];

  for (const topic of topics) {
    const result = await safePromise(
      producer.send({
        topic,
        messages: [{ value }],
      })
    );

    if (result instanceof Error) msg(result.message);
  }
}

export default {
  start,
};
