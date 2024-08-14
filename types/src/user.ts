export enum Role {
  SuperAdmin = "super-admin",
  RegularAdmin = "reg-admin",
  Tutor = "tutor",
  Student = "student",
  Interviewer = "interviewer",
  MediaProvider = "media-provider",
}

export type TutorOrStudent = Role.Tutor | Role.Student;

export type Name = {
  ar: string | null;
  en: string | null;
};

export enum Gender {
  Male = "male",
  Female = "female",
}

export type Self = {
  id: number;
  email: string;
  password: boolean;
  name: Name;
  photo: string | null;
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
  name_ar: string | null;
  name_en: string | null;
  photo: string | null;
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
  name?: Partial<Name>;
  birthYear?: number;
  gender?: Gender;
};

export type UpdatePayload = {
  email?: string;
  password?: string;
  name?: Partial<Name>;
  photo?: string;
  birthYear?: number;
  gender?: Gender;
  verified?: boolean;
  online?: boolean;
  creditScore?: number;
};

export type UpdateApiPayload = {
  email?: string;
  password?: string;
  name?: Partial<Name>;
  birthYear?: number;
  gender?: Gender;
};

export type CreateApiPayload = {
  role: Role;
  email: string;
  password: string;
};
