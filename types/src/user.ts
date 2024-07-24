import { Nullable } from "@/utils";

export enum Type {
  SuperAdmin = "super-admin",
  RegularAdmin = "reg-admin",
  Tutor = "tutor",
  Student = "student",
  Examiner = "examiner",
}

export type TutorOrStudent = Type.Tutor | Type.Student;

export enum Gender {
  Male = "male",
  Female = "female",
}

export type Self = {
  id: number;
  email: string;
  hasPassword: boolean;
  name: Nullable<string>;
  avatar: Nullable<string>;
  birthYear: Nullable<number>;
  gender: Nullable<Gender>;
  type: Type;
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
  avatar: string | null;
  birth_year: number | null;
  gender: Gender | null;
  type: Type;
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

export type UpdatePayload = {
  email?: string;
  password?: string;
  name?: string;
  avatar?: string;
  birthYear?: number;
  gender?: Gender;
  type?: Type;
  verified?: boolean;
  online?: boolean;
};
