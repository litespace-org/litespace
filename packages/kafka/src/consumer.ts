import { IKafka } from "@litespace/types";
import {
  EachMessagePayload,
  Kafka,
  Consumer as KafkaJsConsumer,
  logLevel,
} from "kafkajs";

export class Consumer<T extends IKafka.TopicType> {
  private kafka: Kafka;
  private consumer: KafkaJsConsumer;

  constructor(groupId: string) {
    this.kafka = new Kafka({
      clientId: "litespace",
      brokers: ["localhost:9092"],
      logLevel: logLevel.ERROR,
    });

    this.consumer = this.kafka.consumer({
      groupId,
      allowAutoTopicCreation: true,
    });
  }

  async connect() {
    await this.consumer.connect();
  }

  async disconnect() {
    await this.consumer.disconnect();
  }

  async subscribe({
    topics,
    fromBeginning,
  }: {
    topics: T[];
    fromBeginning?: boolean;
  }) {
    await this.consumer.subscribe({ topics, fromBeginning });
  }
  async run({
    eachMessage,
  }: {
    eachMessage: (payload: {
      topic: T;
      value: IKafka.ValueOf<T> | null;
    }) => Promise<void>;
  }) {
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const value = payload.message.value;

        await eachMessage({
          topic: payload.topic as T,
          value: value
            ? (JSON.parse(value.toString("utf-8")) as IKafka.ValueOf<T>)
            : null,
        });
      },
    });
  }

  pause(topics: T[]) {
    this.consumer.pause(topics.map((topic) => ({ topic })));
  }

  resume(topics: T[]) {
    this.consumer.resume(topics.map((topic) => ({ topic })));
  }

  wait(topics: T[], period: number) {
    this.pause(topics);
    setTimeout(() => this.resume(topics), period);
  }
}
