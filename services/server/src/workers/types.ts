import { ISessionEvent, ISession, IUser } from "@litespace/types";

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
    }
  | {
      type: "send-message";
      payload:
        | {
            type: "create-lesson";
            studentName: string | null;
            start: string;
            duration: number;
            phone: string;
            method: IUser.NotificationMethod;
          }
        | {
            type: "update-lesson";
            studentName: string | null;
            previous: { start: string; duration: number };
            current: { start: string; duration: number };
            phone: string;
            method: IUser.NotificationMethod;
          }
        | {
            type: "cancel-lesson";
            start: string;
            canceller: {
              name: string | null;
              role: IUser.Role;
            };
            phone: string;
            method: IUser.NotificationMethod;
          };
    };

export type WorkerMessageType = WorkerMessage["type"];

export type WorkerMessageOf<T extends WorkerMessageType> = Extract<
  WorkerMessage,
  { type: T }
>;

export type WorkerMessagePayloadOf<T extends WorkerMessageType> =
  WorkerMessageOf<T>["payload"];
