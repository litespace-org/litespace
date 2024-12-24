import { ISession, IFilter, IInterview, Paginated } from ".";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

export enum Status {
  Pending = "pending",
  Passed = "passed",
  Rejected = "rejected",
  Canceled = "canceled",
}

export type Self = {
  ids: {
    /**
     * The interview ID itself.
     */
    self: number;
    /**
     * The interviewer id (the id of the tutor manager).
     */
    interviewer: number;
    /**
     * The interviewee id (the id of the tutor)
     */
    interviewee: number;
    rule: number;
    session: ISession.Id; /** @deprecated */
  };
  // sessionId has to be extracted from ids to be compatible with ILesson.Self 
  // as ISession.Self is either a lesson.self or interview.self
  sessionId: ISession.Id;
  /**
   * ISO UTC datetime.
   */
  start: string;
  feedback: { interviewer: string | null; interviewee: string | null };
  note: string | null;
  level: number | null;
  status: Status;
  /**
   * Singer: the id for the super admin who signed the interview.
   *
   * When the signer is null, it means that the interview is not signed yet.
   */
  signer: number | null;
  canceledBy: number | null;
  canceledAt: string | null;
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
  rule_id: number;
  session_id: ISession.Id;
  note: string | null;
  level: number | null;
  status: Status;
  signer: number | null;
  canceled_by: number | null;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  /**
   * ISO UTC datetime.
   */
  start: string;
  session: ISession.Id;
  rule: number;
  interviewer: number;
  interviewee: number;
};

export type CreateApiPayload = {
  interviewerId: number;
  /**
   * ISO date (UTC)
   */
  start: string;
  ruleId: number;
};

export type CreateInterviewApiResponse = Self;

export type FindInterviewsApiResponse = {
  list: Self[];
  total: number;
};

export type UpdatePayload = {
  feedback?: { interviewer?: string; interviewee?: string };
  note?: string;
  level?: number;
  status?: Status;
  signer?: number | null;
  canceledBy?: number | null;
  /**
   * ISO datetime.
   */
  canceledAt?: string | null;
};

export type UpdateApiPayload = {
  feedback?: { interviewer?: string; interviewee?: string };
  note?: string;
  level?: number;
  status?: Status;
  sign?: true;
};

export type FindInterviewsApiQuery = IFilter.Pagination & {
  users?: number[];
  statuses?: Status[];
  levels?: number[];
  signed?: boolean;
  signers?: number[];
};

/**
 * @deprecated should be removed
 */
export type FindPagedInterviewsProps = {
  query: UseInfiniteQueryResult<
    InfiniteData<
      Paginated<{
        interview: IInterview.Self;
        session: ISession.Self;
        members: ISession.PopuldatedMember[];
      }>,
      unknown
    >,
    Error
  >;
  list:
    | {
        interview: IInterview.Self;
        session: ISession.Self;
        members: ISession.PopuldatedMember[];
      }[]
    | null;
  more: () => void;
};
