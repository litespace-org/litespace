import { Kafka, Producer as BaseProducer } from "kafkajs";
import { IKafka } from "@litespace/types";

export class Producer {
  private kafka: Kafka;
  private producer: BaseProducer;

  constructor() {
    this.kafka = new Kafka({
      clientId: "litespace",
      brokers: ["localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async send<T extends IKafka.TopicType>({
    topic,
    messages,
  }: IKafka.SendTopicPayload<T>) {
    await this.producer.send({
      topic,
      messages: messages.map(({ value, key }) => ({
        key,
        value: JSON.stringify(value),
      })),
    });
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}
