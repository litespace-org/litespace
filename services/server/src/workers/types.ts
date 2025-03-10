import { Server } from "@litespace/types";

export type WorkerMessagePayloadMap = {
  "send-user-verification-email": {
    user: number;
    email: string;
    callbackUrl: string;
  };
  "send-forget-password-email": {
    user: number;
    email: string;
    callbackUrl: string;
  };
  "update-tutor-in-cache": {
    tutorId: number;
  };
};

export type WorkerMessageType = keyof WorkerMessagePayloadMap;

export type WorkerMessage<T extends WorkerMessageType> = {
  type: T;
  payload: WorkerMessagePayloadMap[T];
};

export enum PartentPortMessageType {
  Stats,
}

export type PartentPortMessage = {
  type: PartentPortMessageType.Stats;
  stats: Server.Stats;
};
