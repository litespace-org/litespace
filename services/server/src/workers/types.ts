import { ISessionEvent, ISession } from "@litespace/types";

export type WorkerMessage =
  | {
      type:
        | "send-user-verification-code-email"
        | "send-forget-password-code-email";
      payload: {
        email: string;
        code: number;
      };
    }
  | {
      type: "update-tutor-cache";
      payload: { tutorId: number };
    }
  | {
      type: "create-session-event";
      payload: {
        type: ISessionEvent.EventType;
        userId: number;
        sessionId: ISession.Id;
      };
    };

export type WorkerMessageType = WorkerMessage["type"];

export type WorkerMessageOf<T extends WorkerMessageType> = Extract<
  WorkerMessage,
  { type: T }
>;

export type WorkerMessagePayloadOf<T extends WorkerMessageType> =
  WorkerMessageOf<T>["payload"];
