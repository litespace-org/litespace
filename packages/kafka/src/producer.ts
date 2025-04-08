import { Kafka, Producer as KafkaJsProducer } from "kafkajs";
import { IKafka } from "@litespace/types";

export class Producer {
  private kafka: Kafka;
  private producer: KafkaJsProducer;
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: "litespace",
      brokers: ["localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    if (this.isConnected) return;
    await this.producer.connect();
    this.isConnected = true;
  }

  async send<T extends IKafka.Topics>({
    topic,
    key,
    value,
  }: IKafka.KafkaProducerMessage<T>) {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
    });
  }

  async disconnect() {
    if (!this.isConnected) return;
    await this.producer.disconnect();
    this.isConnected = false;
  }
}
