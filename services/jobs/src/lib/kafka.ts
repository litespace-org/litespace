import { Producer } from "@litespace/kafka";

export const producer = new Producer();
producer.connect();
