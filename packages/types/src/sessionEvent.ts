import { ISession } from "@/index";

export enum EventType {
  UserJoined = 1,
  UserLeft = 2,
}

export type Row = {
  id: number;
  type: EventType;
  user_id: number;
  session_id: ISession.Id;
  created_at: Date;
};

export type Self = {
  id: number;
  type: EventType;
  userId: number;
  sessionId: ISession.Id;
  createdAt: string;
};

export type CreatePayload = {
  type: EventType;
  userId: number;
  sessionId: ISession.Id;
};
