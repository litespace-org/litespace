import { IUser, IRule, Paginated, IFilter } from "@/index";

export type Self = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activated: boolean | null;
  activatedBy: number | null;
  /**
   * The period that be available before booking any lesson with the tutor.
   */
  notice: number;
  createdAt: string;
  updatedAt: string;
};

export type FullTutor = IUser.Self & Self & { metaUpdatedAt: string };
export type FullTutorRow = FullTutor;

export type Cache = {
  id: number;
  name: string | null;
  image: string | null;
  video: string | null;
  bio: string | null;
  about: string | null;
  gender: IUser.Gender | null;
  online: boolean;
  notice: number;
  topics: string[];
  avgRating: number;
  studentCount: number;
  lessonCount: number;
};

export type Row = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activated: boolean | null;
  activated_by: number | null;
  notice: number;
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
  notice?: number;
  activated?: boolean;
  activatedBy?: number;
};

export type FindOnboardedTutorsParams = IFilter.Pagination & {
  /**
   * Search keyword to filter out tutors and topics.
   */
  search?: string;
};

export type CreateApiPayload = IUser.Credentials & { name: string };
export type UpdateApiPayload = Omit<UpdatePayload, "mediaProviderId"> & {
  dropPhoto?: boolean;
  dropVideo?: boolean;
};

export type FindTutorInfoApiResponse = {
  id: number;
  image: string | null;
  video: string | null;
  name: string | null;
  bio: string | null;
  about: string | null;
  topics: string[];
  studentCount: number;
  lessonCount: number;
  avgRating: number;
  notice: number;
};

export type FindOnboardedTutorsApiResponse = {
  total: number;
  list: Array<Cache & { rules: IRule.RuleEvent[] }>;
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

export type FindTutorStatsApiResponse = {
  lessonCount: number;
  studentCount: number;
  totalMinutes: number;
};

/**
 * Map from ISO Date (YYYY-MM-DD) to the activity score
 */
export type ActivityScoreMap = Record<
  string,
  { score: number; lessonCount: number }
>;

export type FindTutorActivityScores = ActivityScoreMap;

export type FindTutorMetaApiResponse = Self;
