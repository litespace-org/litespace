import * as User from "@/user";

export type Self = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activated: boolean | null;
  activatedBy: number | null;
  passedInterview: boolean | null;
  interviewUrl: string | null;
  mediaProviderId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type FullTutor = User.Self & Self & { metaUpdatedAt: string };
export type FullTutorRow = Omit<FullTutor, "name"> & {
  arabicName: string | null;
  englishName: string | null;
};

export type Row = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activated: boolean | null;
  activated_by: number | null;
  passed_interview: boolean | null;
  interview_url: string | null;
  media_provider_id: number | null;
  created_at: Date;
  updated_at: Date;
};

export type TutorMedia = {
  id: number;
  email: string;
  name: string | null;
  photo: string | null;
  video: string | null;
};

export type UpdatePayload = {
  bio?: string;
  about?: string;
  video?: string | null;
  activated?: boolean;
  activatedBy?: number;
  passedInterview?: boolean;
  mediaProviderId?: number;
};

export type CreateApiPayload = User.Credentials & { name: string };
export type UpdateApiPayload = Omit<UpdatePayload, "mediaProviderId"> & {
  dropPhoto?: boolean;
  dropVideo?: boolean;
};
