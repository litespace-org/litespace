import { ISession, Paginated } from "@/index";
import { Pagination } from "@/filter";

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

export type MetaRow = Row & {
  user_name: string;
  session_start: Date;
};

export type Self = {
  id: number;
  type: EventType;
  userId: number;
  sessionId: ISession.Id;
  createdAt: string;
};
export type MetaSelf = Self & {
  userName: string;
  sessionStart: string;
};

export type CreatePayload = {
  type: EventType;
  userId: number;
  sessionId: ISession.Id;
};

export type FindModelQuery = Pagination & {
  userIds?: number[];
  sessionIds?: number[];
};

export type FindApiQuery = FindModelQuery;

export type FindApiResponse = Paginated<MetaSelf>;

export type State = "attended-on-time" | "attended-late" | "absent";

export type FindBySessionIdApiQuery = {
  sessionId: ISession.Id;
};

export type FindBySessionIdModelQuery = FindBySessionIdApiQuery;

export type FindBySessionIdModelResponse = {
  tutor: MetaSelf[];
  student: MetaSelf[];
};

export type FindBySessionIdApiResponse = {
  tutor: { events: MetaSelf[]; state: State };
  student: { events: MetaSelf[]; state: State };
};
