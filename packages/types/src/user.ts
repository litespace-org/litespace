import { Paginated } from "@/utils";
import { IFilter } from "@/index";

export enum Role {
  SuperAdmin = "super-admin",
  RegularAdmin = "reg-admin",
  Tutor = "tutor",
  Student = "student",
  Interviewer = "interviewer",
  MediaProvider = "media-provider",
}

export enum Gender {
  Male = "male",
  Female = "female",
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
  online: boolean;
  verified: boolean;
  creditScore: number;
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
  online: boolean;
  verified: boolean;
  credit_score: number;
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
  password?: string;
  name?: string;
  birthYear?: number;
  gender?: Gender;
};

export type UpdatePayload = {
  email?: string;
  password?: string;
  name?: string;
  image?: string | null;
  birthYear?: number;
  gender?: Gender;
  verified?: boolean;
  online?: boolean;
  creditScore?: number;
};

export type UpdateApiPayload = {
  email?: string;
  password?: string;
  name?: string;
  gender?: Gender;
  notice?: number;
  birthYear?: number;
  drop?: { image?: boolean; video?: boolean };
  bio?: string;
  about?: string;
};

export enum UpdateMediaFilesApiKeys {
  Image = "image",
  Video = "video",
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

export type ForegetPasswordApiPayload = {
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
  online?: boolean;
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

export type Ghost = "ghost" & {
  __type: "ghost";
};

export const GHOST = "ghost" as Ghost;
