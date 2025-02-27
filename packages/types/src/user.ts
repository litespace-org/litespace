import { Paginated } from "@/utils";
import { IFilter } from "@/index";

export enum Role {
  SuperAdmin = "super-admin",
  RegularAdmin = "reg-admin",
  Tutor = "tutor",
  Student = "student",
  TutorManager = "tutor-manager",
  Studio = "studio",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export enum City {
  Cairo = 1,
  Alexandria = 2,
  Giza = 3,
  Dakahlia = 4,
  Qalyubia = 5,
  Sharkia = 6,
  Beheira = 7,
  Aswan = 8,
  Asyut = 9,
  BeniSuef = 10,
  PortSaid = 11,
  Suez = 12,
  Minya = 13,
  Gharbia = 14,
  Ismailia = 15,
  KafrElSheikh = 16,
  Matrouh = 17,
  RedSea = 18,
  Sohag = 19,
  Fayoum = 20,
  Luxor = 21,
  Qena = 22,
  NewValley = 23,
  NorthSinai = 24,
  SouthSinai = 25,
  Damietta = 26,
  Monufia = 27,
  Minufiya = 28,
  Helwan = 29,
  GizaCity = 30,
}

export type Self = {
  id: number;
  email: string;
  password: boolean;
  name: string | null;
  image: string | null;
  birthYear: number | null;
  gender: Gender | null;
  role: Role;
  verified: boolean;
  creditScore: number;
  city: City | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  email: string;
  password: string | null;
  name: string | null;
  image: string | null;
  birth_year: number | null;
  gender: Gender | null;
  role: Role;
  verified: boolean;
  credit_score: number;
  city: City | null;
  phone_number: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Credentials = {
  email: string;
  password: string;
};

export type CreatePayload = {
  role?: Role;
  email?: string;
  verified?: boolean;
  password?: string;
  name?: string;
  birthYear?: number;
  gender?: Gender;
};

export type UpdatePayload = {
  email?: string;
  password?: string;
  name?: string | null;
  image?: string | null;
  birthYear?: number;
  gender?: Gender;
  verified?: boolean;
  creditScore?: number;
  phoneNumber?: string | null;
  city?: City | null;
};

export type UpdateApiPayload = {
  email?: string;
  password?: { new: string; current: string | null };
  /**
   * - Passing `string` will set the user name to the new value.
   * - Passing `null` will reset user name to `null`
   * - Passing `undefine` will not update the user name.
   */
  name?: string | null;
  gender?: Gender;
  notice?: number;
  birthYear?: number;
  drop?: { image?: boolean; video?: boolean };
  bio?: string;
  about?: string;
  phoneNumber?: string | null;
  city?: City | null;
};

export enum AssetFileName {
  Image = "image",
  Video = "video",
  Thumbnail = "thumbnail",
}

export type CreateApiPayload = {
  role: Role;
  email: string;
  password: string;
  callbackUrl: string;
};

export type UpdateMediaPayload =
  | { image: File }
  | { video: File }
  | { image: File; video: File };

export type LoginApiResponse = {
  user: Self;
  token: string;
};

export type RegisterApiResponse = LoginApiResponse;

export type FindUsersApiResponse = Paginated<Self>;

export type ResetPasswordApiResponse = LoginApiResponse;

export type LoginWithAuthTokenApiResponse = LoginApiResponse;

export type FindCurrentUserApiResponse = LoginApiResponse;

export type ForgetPasswordApiPayload = {
  email: string;
  callbackUrl: string;
};

export type ResetPasswordApiPayload = {
  token: string;
  password: string;
};

export type FindUsersApiQuery = IFilter.Pagination & {
  role?: Role;
  verified?: boolean;
  gender?: Gender;
  city?: City;
  orderBy?: Extract<keyof Row, "created_at" | "updated_at">;
  orderDirection?: IFilter.OrderDirection;
};

export type FindStudentStatsApiResponse = {
  lessonCount: {
    total: number;
    ratified: number;
    canceled: number;
    future: {
      total: number;
      ratified: number;
      canceled: number;
    };
    past: {
      total: number;
      ratified: number;
      canceled: number;
    };
  };
  tutorCount: {
    total: number;
    ratified: number;
    canceled: number;
  };
  minutes: {
    total: number;
    ratified: number;
    canceled: number;
  };
};

export type FindPersonalizedStudentStatsApiResponse = {
  /**
   * Tutors that the student interacted with.
   */
  tutorCount: number;
  /**
   * Count for completed lessons only.
   */
  completedLessonCount: number;
  /**
   * Total sum of all completed lessons in minutes.
   */
  totalLearningTime: number;
  /**
   * Future but not canceled lessons.
   */
  upcomingLessonCount: number;
};

export type Ghost = `ghost:${string}`;

export type GoogleAuthPayload = {
  token: string;
  type: "bearer" | "id-token";
  role?: Role.Student | Role.Tutor | Role.TutorManager;
};

export type UploadUserImageQuery = {
  forUser?: number;
};

export type UploadTutorAssetsQuery = {
  tutorId: number;
};
