import { ISession, IFilter, IUser } from "@/index";

export enum Status {
  Pending = 1,
  Passed = 2,
  Rejected = 3,
  CanceledByInterviewer = 4,
  CanceledByInterviewee = 5,
}

export type Self = {
  id: number;
  interviewerId: number;
  intervieweeId: number;
  interviewerFeedback: string | null;
  /**
   * @note `null` feedback means that the tutor didn't provide a feedback yet.
   * @note empty string feedback mean that the tutor skipped the feedback.
   */
  intervieweeFeedback: string | null;
  slotId: number;
  sessionId: ISession.Id;
  /**
   * interview start date time as iso utc string.
   */
  start: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  start: Date;
  interviewer_id: number;
  interviewee_id: number;
  interviewer_feedback: string | null;
  interviewee_feedback: string | null;
  slot_id: number;
  session_id: ISession.Id;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

export type Column = keyof Row;

export type Field = keyof Self;

export type CreateModelPayload = {
  start: string;
  session: ISession.Id;
  slot: number;
  interviewerId: number;
  intervieweeId: number;
};

export type CreateApiPayload = {
  start: string;
  slotId: number;
};

export type CreateApiResponse = void;

export type InterviewMember = {
  id: number;
  name: string | null;
  image: string | null;
  role: IUser.Role;
};

export type FindApiResponse = {
  list: Array<
    Self & {
      interviewer: InterviewMember;
      interviewee: InterviewMember;
    }
  >;
  total: number;
};

export type UpdatePayload = {
  id: number;
  interviewerFeedback?: string;
  intervieweeFeedback?: string;
  status?: Status;
};

export type UpdateApiPayload = {
  id: number;
  interviewerFeedback?: string;
  intervieweeFeedback?: string;
  status?: Status;
};

export type UpdateApiResponse = void;

export type FindModelQuery<T extends Field = Field> =
  IFilter.SkippablePagination & {
    ids?: number[];
    users?: number[];
    interviewers?: number[];
    interviewees?: number[];
    interviewerFeedback?: string | null;
    intervieweeFeedback?: string | null;
    slots?: number[];
    sessions?: ISession.Id[];
    statuses?: Status[];
    start?: IFilter.Date;
    end?: IFilter.Date;
    createdAt?: IFilter.Date;
    canceled?: boolean;
    select?: T[];
  };

export type FindApiQuery = FindModelQuery;

export type SelectInterviewerApiResponse = {
  id: number;
  name: string | null;
  image: string | null;
};
