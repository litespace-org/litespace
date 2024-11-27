import { ICall, IFilter, IInterview, Paginated } from ".";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

export enum Status {
  Pending = "pending",
  Passed = "passed",
  Rejected = "rejected",
  Canceled = "canceled",
}

export type Self = {
  ids: {
    self: number;
    interviewer: number;
    interviewee: number;
    call: number;
  };
  feedback: { interviewer: string | null; interviewee: string | null };
  note: string | null;
  level: number | null;
  status: Status;
  signer: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  interviewer_id: number;
  interviewee_id: number;
  call_id: number;
  interviewer_feedback: string | null;
  interviewee_feedback: string | null;
  note: string | null;
  level: number | null;
  status: Status;
  signer: number | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  interviewer: number;
  interviewee: number;
  call: number;
};

export type CreateApiPayload = {
  interviewerId: number;
  /**
   * ISO date (UTC)
   */
  start: string;
  ruleId: number;
};

export type FindInterviewsApiResponse = {
  list: Array<{
    interview: Self;
    call: ICall.Self;
    members: ICall.PopuldatedMember[];
  }>;
  total: number;
};

export type UpdatePayload = {
  feedback?: { interviewer?: string; interviewee?: string };
  note?: string;
  level?: number;
  status?: Status;
  signer?: number | null;
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
        call: ICall.Self;
        members: ICall.PopuldatedMember[];
      }>,
      unknown
    >,
    Error
  >;
  list:
    | {
        interview: IInterview.Self;
        call: ICall.Self;
        members: ICall.PopuldatedMember[];
      }[]
    | null;
  more: () => void;
};
