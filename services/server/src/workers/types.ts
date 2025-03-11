import { IEvent } from "@litespace/types";

export type WorkerMessage =
  | {
      type: "send-user-verification-email" | "send-forget-password-email";
      payload: {
        user: number;
        email: string;
        callbackUrl: string;
      };
    }
  | {
      type: "update-tutor-cache";
      payload: { tutorId: number };
    }
  | {
      type: "insert-event-record";
      payload: {
        type: IEvent.EventType;
        userId: number;
      };
    };

export type WorkerMessageType = WorkerMessage["type"];

export type WorkerMessageOf<T extends WorkerMessageType> = Extract<
  WorkerMessage,
  { type: T }
>;
