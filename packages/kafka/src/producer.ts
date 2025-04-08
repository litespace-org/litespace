import { Kafka, Producer as KafkaJsProducer } from "kafkajs";
import { IKafka } from "@litespace/types";

export class Producer {
  private kafka: Kafka;
  private producer: KafkaJsProducer;

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

  async send<T>({ topic, key, value }: IKafka.KafkaProducerMessage<T>) {
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
    await this.producer.disconnect();
  }
}
