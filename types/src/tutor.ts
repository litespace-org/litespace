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
  activated: boolean | null;
  activated_by: number | null;
  passed_interview: boolean | null;
  private_feedback: string | null;
  public_feedback: string | null;
  interview_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export type UpdatePayload = {
  email?: string;
  password?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  about?: string;
  video?: string;
  activated?: boolean;
  activatedBy?: number;
  passedInterview?: boolean;
  privateFeedback?: string;
  publicFeedback?: string;
  interviewUrl?: string;
};

export type CreateApiPayload = User.Credentials & { name: string };
export type UpdateApiPayload = UpdatePayload;

// todo: delete this type
export type Shareable = Omit<Self, "zoomRefreshToken">;
