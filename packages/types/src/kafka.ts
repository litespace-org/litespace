export type Topics = "whatsapp" | "telegram";

export interface KafkaEvent<T = unknown> {
  topic: Topics;
  value: T;
}

export interface KafkaProducerMessage<T> {
  topic: Topics;
  key?: string;
  value: T;
}
