export type Topics =
  | {
      topic: "whatsapp";
      value: {
        to: string;
        message: string;
        expiresAt?: string;
      };
    }
  | {
      topic: "telegram";
      value: {
        to: string;
        message: string;
        expiresAt?: string;
      };
    };

export type TopicType = Topics["topic"];

export type TopicOf<T extends TopicType> = Extract<Topics, { topic: T }>;

export type ValueOf<T extends TopicType> = TopicOf<T>["value"];

export type SendTopicPayload<T extends TopicType> = {
  topic: T;
  messages: Array<{
    key?: string;
    value: ValueOf<T>;
  }>;
};
