import { IFilter, IUser } from "@/index";

export enum EnglishLevel {
  Beginner = 1,
  PreIntermediate = 2,
  Intermediate = 3,
  UpperIntermediate = 4,
  Advanced = 5,
  Mastery = 6,
}

export type Self = {
  id: number;
  userId: number;
  jobTitle: string | null;
  englishLevel: EnglishLevel | null;
  learningObjective: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  job_title: string | null;
  english_level: EnglishLevel | null;
  learning_objective: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CreateApiPayload = unknown;
export type CreateApiResponse = IUser.RegisterApiResponse & unknown;

export type UpdateApiPayload = unknown;
export type UpdateApiResponse = unknown;

export type Column = keyof Row;
export type Field = keyof Self;

export type CreateModelPayload = {
  userId: number;
  jobTitle?: string | null;
  englishLevel?: EnglishLevel | null;
  learningObjective?: string | null;
};

export type UpdateModelPayload = {
  id: number;
  jobTitle?: string | null;
  englishLevel?: EnglishLevel | null;
  learningObjective?: string | null;
};

export type FindModelQuery = IFilter.SkippablePagination & {
  ids?: number[];
  jobTitle?: string;
  englishLevels?: EnglishLevel[];
  learningObjective?: string;
};
