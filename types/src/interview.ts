import { ICall } from ".";

export type Self = {
  ids: {
    self: number;
    interviewer: number;
    interviewee: number;
    call: number;
  };
  feedback: { interviewer: string | null; interviewee: string | null };
  interviewerNote: string | null;
  score: number | null;
  passed: boolean | null;
  passedAt: string | null;
  approved: boolean | null;
  approvedAt: string | null;
  approvedBy: number | null;
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
  interviewer_note: string | null;
  score: number | null;
  passed: boolean | null;
  passed_at: Date | null;
  approved: boolean | null;
  approved_at: Date | null;
  approved_by: number | null;
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
  interviewerNote?: string;
  score?: number;
  passed?: boolean;
  approved?: boolean;
  approvedBy?: number;
};
