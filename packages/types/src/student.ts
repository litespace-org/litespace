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
  englishLevel: EnglishLevel;
  learningObjective: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  job_title: string | null;
  english_level: number | null;
  learning_objective: string | null;
  created_at: Date;
  updated_at: Date;
};
