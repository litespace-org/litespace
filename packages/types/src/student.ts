import { IFilter, Paginated } from "@/index";

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
  user_id: number;
  job_title: string | null;
  english_level: EnglishLevel | null;
  learning_objective: string | null;
  created_at: Date;
  updated_at: Date;
};

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

// API Types
export type CreateApiPayload = {
  email: string;
  password: string;
  name?: string;
  jobTitle?: string;
  englishLevel?: EnglishLevel;
  learningObjective?: string;
};

export type CreateApiResponse = {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: number; // Student role
    verifiedEmail: boolean;
    verifiedPhone: boolean;
    verifiedWhatsApp: boolean;
    creditScore: number;
    createdAt: string;
    updatedAt: string;
  };
  student: Self;
  token: string;
};

export type FindApiResponse = Paginated<Self>;
