import { IUser } from "@/index";
import { IRule, Paginated } from "@/index";

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

export type FullTutor = IUser.Self & Self & { metaUpdatedAt: string };
export type FullTutorRow = FullTutor;

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
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  video: Self["video"];
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

export type CreateApiPayload = IUser.Credentials & { name: string };
export type UpdateApiPayload = Omit<UpdatePayload, "mediaProviderId"> & {
  dropPhoto?: boolean;
  dropVideo?: boolean;
};

export type Cache = {
  start: string;
  end: string;
  tutors: FullTutor[];
  unpackedRules: Record<string, Array<IRule.RuleEvent>>;
};

export type FindAvailableTutorsApiResponse = {
  total: number;
  tutors: Cache["tutors"];
  rules: Cache["unpackedRules"];
};

export type PublicTutorFieldsForMediaProvider = {
  id: number;
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  video: Self["video"];
  createdAt: string;
};

export type FindTutorsForMediaProviderApiResponse =
  Paginated<PublicTutorFieldsForMediaProvider>;
