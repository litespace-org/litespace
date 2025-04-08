export type Topics = "whatsapp" | "telegram";

export type MessageMap = {
  whatsapp: {
    to: string;
    message: string;
  };
  telegram: {
    to: string;
    message: string;
  };
};

export type KafkaEvent<T = unknown> = {
  topic: Topics;
  value: T;
};

export type KafkaProducerMessage<T extends Topics> = {
  topic: Topics;
  key?: string;
  value: MessageMap[T];
};
