import { IUser, Paginated, IFilter, OmitProp } from "@/index";
import { Pagination } from "@/filter";

export type Self = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  studioId: number | null;
  thumbnail: string | null;
  activated: boolean;
  /**
   * The period that be available before booking any lesson with the tutor.
   */
  notice: number;
  bypassOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Full = IUser.Self &
  OmitProp<Self, "createdAt" | "updatedAt"> & {
    meta: {
      updatedAt: string;
      createdAt: string;
    };
  };

export type FullRow = OmitProp<IUser.Row, "created_at" | "updated_at"> &
  OmitProp<Row, "created_at" | "updated_at"> & {
    tutor_created_at: Date;
    tutor_updated_at: Date;
    user_created_at: Date;
    user_updated_at: Date;
  };

export type Cache = {
  id: number;
  role: IUser.Role;
  name: string | null;
  image: string | null;
  video: string | null;
  thumbnail: string | null;
  bio: string | null;
  about: string | null;
  gender: IUser.Gender | null;
  notice: number;
  topics: string[];
  avgRating: number;
  studentCount: number;
  lessonCount: number;
};

export type Row = {
  id: number;
  notice: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  activated: boolean;
  studio_id: number | null;
  thumbnail: string | null;
  bypass_onboarding: boolean;
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
  bio?: string | null;
  about?: string | null;
  video?: string | null;
  thumbnail?: string | null;
  studioId?: number | null;
  notice?: number;
  activated?: boolean;
  bypassOnboarding?: boolean;
};

export type Assets = {
  tutorId: number;
  image: string | null;
  video: string | null;
  thumbnail: string | null;
  studioId: number | null;
};

export type UncontactedTutorInfo = {
  id: number;
  name: string | null;
  image: string | null;
  bio: string | null;
  role: IUser.Role;
  gender: IUser.Gender;
  lastSeen: string;
};

export type FullUncontactedTutorInfo = UncontactedTutorInfo & {
  online: boolean;
};

export type FindOnboardedTutorsQuery = IFilter.Pagination & {
  /**
   * Search keyword to filter out tutors and topics.
   */
  search?: string;
};

export type CreateApiPayload = IUser.Credentials & { name: string };
export type UpdateApiPayload = UpdatePayload;

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
  list: Array<Cache>;
};

export type StudioTutorFieldsRow = {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  video: string | null;
  thumbnail: string | null;
  studioId: number | null;
  createdAt: Date;
};

export type StudioTutorFields = {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  video: string | null;
  thumbnail: string | null;
  studioId: number | null;
  createdAt: string;
};

export type FindStudioTutorParams = { tutorId: number };

export type FindStudioTutorApiResponse = StudioTutorFields;

export type FindStudioTutorsQuery = {
  studioId?: number;
  pagination?: Pagination;
  search?: string;
};

export type FindStudioTutorsApiResponse = Paginated<StudioTutorFields>;

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

export type FindTutorMetaApiQuery = {
  tutorId: number;
};

export type FindTutorMetaApiResponse = Self & {
  passedIntroVideo: boolean;
  passedInterview: boolean;
  passedDemoSession: boolean;
};

export type FindPersonalizedTutorStatsApiResponse = {
  /**
   * Total sum of all completed lessons.
   */
  totalLessonCount: number;
  /**
   * Total tutoring time in minutes.
   */
  totalTutoringTime: number;
  /**
   * Count for completed lessons only.
   */
  completedLessonCount: number;
  /**
   * Students that the tutor interacted with.
   */
  studentCount: number;
};

export type FindUncontactedTutors = Paginated<UncontactedTutorInfo>;
export type FindFullUncontactedTutorsApiResponse =
  Paginated<FullUncontactedTutorInfo>;

export type FindModelQuery = IFilter.SkippablePagination & {
  bio?: string | null;
  about?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string;
  video?: boolean;
  image?: boolean;
  thumbnail?: boolean;
  activated?: boolean;
  verifiedEmail?: boolean;
  verifiedPhone?: boolean;
  verifiedTelegram?: boolean;
  verifiedWhatsapp?: boolean;
  password?: boolean;
  notice?: IFilter.Numeric;
  birthYear?: IFilter.Numeric;
  createdAt?: IFilter.Date;
  notificationMethod?: IUser.NotificationMethod[];
  city?: IUser.City[];
  gender?: IUser.Gender[];
  role?: Array<IUser.Role.TutorManager | IUser.Role.Tutor>;
};

export type FindFullTutorsApiQuery = FindModelQuery & Pagination;

export type FindFullTutorsApiResponse = Paginated<Full>;

export type FindTutoringMinutesApiQuery = {
  before?: string;
  after?: string;
};

export type FindTutoringMinutesApiResponse = Array<{
  tutorId: number;
  tutoringMinutes: number;
}>;
