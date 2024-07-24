import { Nullable } from "@/utils";

export enum Type {
  SuperAdmin = "super_admin",
  RegularAdmin = "reg_admin",
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
  createdAt: string;
  updatedAt: string;
};

export type Row = Omit<
  Self,
  "createdAt" | "updatedAt" | "hasPassword" | "birthYear"
> & {
  birth_year: number;
  password: Nullable<string>;
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
