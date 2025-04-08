import { IKafka } from "@litespace/types";
import { Kafka, Consumer as KafkaJsConsumer } from "kafkajs";

export class Consumer {
  private kafka: Kafka;
  private consumer: KafkaJsConsumer;

  constructor(groupId: string) {
    this.kafka = new Kafka({
      clientId: "litespace",
      brokers: ["localhost:9092"],
    });
    this.consumer = this.kafka.consumer({ groupId });
  }

  async connect() {
    await this.consumer.connect();
  }

  async subscribe(
    topic: IKafka.Topics,
    handler: (data: unknown) => Promise<void>
  ) {
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const value = JSON.parse(message.value.toString());
        await handler(value);
      },
    });
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
