import { IFilter, ISession, Paginated } from ".";

export enum Status {
  Pending = 1,
  Passed = 2,
  Rejected = 3,
  CanceledByTutorManager = 4,
  CanceledByTutor = 5,
  CanceledByAdmin = 6,
}

export type Row = {
  id: number;
  session_id: ISession.Id;
  tutor_id: number;
  slot_id: number;
  start: Date;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  sessionId: ISession.Id;
  tutorId: number;
  slotId: number;
  /**
   * session start time as iso date time string
   */
  start: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

export type Column = keyof Row;

export type Field = keyof Self;

export type CreateModelPayload = {
  slotId: number;
  tutorId: number;
  /**
   * session start time as iso date time string
   */
  start: string;
};

export type UpdateModelPayload = {
  /**
   * the id of the demo-session to be updated
   */
  id: number;
  status: Status;
};

export type FindModelQuery<T extends Field = Field> =
  IFilter.SkippablePagination & {
    ids?: number[];
    sessionIds?: ISession.Id[];
    tutorIds?: number[];
    slotIds?: number[];
    tutorManagerIds?: number[];
    statuses?: Status[];
    start?: IFilter.Date;
    createdAt?: IFilter.Date;
    updatedAt?: IFilter.Date;
    select?: T[];
  };

export type CreateApiPayload = {
  slotId: number;
  /**
   * session start time as iso date time string
   */
  start: string;
};

export type CreateApiResponse = void;

export type UpdateApiPayload = {
  /**
   * the id of the demo-session to be updated
   */
  id: number;
  status: Status;
};

export type UpdateApiResponse = void;

export type FindApiQuery = IFilter.SkippablePagination & {
  ids?: number[];
  sessionIds?: ISession.Id[];
  tutorIds?: number[];
  slotIds?: number[];
  tutorManagerIds?: number[];
  statuses?: Status[];
  start?: IFilter.Date;
  createdAt?: IFilter.Date;
  updatedAt?: IFilter.Date;
};

export type FindApiResponse = Paginated<Self>;
