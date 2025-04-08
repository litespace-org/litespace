import { IKafka } from "@litespace/types";
import { Kafka, Consumer as KafkaJsConsumer } from "kafkajs";

export class Consumer {
  private kafka: Kafka;
  private consumer: KafkaJsConsumer;
  private isConnected = false;

  constructor(groupId: string) {
    this.kafka = new Kafka({
      clientId: "litespace",
      brokers: ["localhost:9092"],
    });
    this.consumer = this.kafka.consumer({ groupId });
  }

  async connect() {
    if (this.isConnected) return;
    await this.consumer.connect();
    this.isConnected = true;
  }

  async subscribe<T extends IKafka.Topics>(
    topic: IKafka.Topics,
    handler: (data: IKafka.MessageMap[T]) => Promise<void>,
    fromBeginning = false
  ) {
    try {
      await this.consumer.subscribe({ topic, fromBeginning });

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          try {
            const value = JSON.parse(
              message.value.toString()
            ) as IKafka.MessageMap[T];
            await handler(value);
          } catch (error) {
            console.error("Error processing message:", error);
          }
        },
      });
    } catch (error) {
      console.error("Error subscribing to topic:", error);
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    await this.consumer.disconnect();
    this.isConnected = false;
  }
}
