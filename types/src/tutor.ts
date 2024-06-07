import * as User from "@/user";

export type Self = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activated: boolean | null;
  activatedBy: number | null;
  passedInterview: boolean | null;
  privateFeedback: string | null;
  publicFeedback: string | null;
  interviewUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FullTutor = User.Self &
  Omit<Self, "id" | "createdAt" | "updatedAt"> & { metaUpdatedAt: string };

export type Row = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activate: boolean | null;
  activated_by: number | null;
  passed_interview: boolean | null;
  private_feedback: string | null;
  public_feedback: string | null;
  interview_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Shareable = Omit<Self, "zoomRefreshToken">;
