export enum Role {
  SuperAdmin = "super-admin",
  RegularAdmin = "reg-admin",
  Tutor = "tutor",
  Student = "student",
  Interviewer = "interviewer",
  MediaProvider = "media-provider",
}

export type TutorOrStudent = Role.Tutor | Role.Student;

export enum Gender {
  Male = "male",
  Female = "female",
}

export type Self = {
  id: number;
  email: string;
  hasPassword: boolean;
  name: string | null;
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
  name: string | null;
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

export type UpdatePayload = {
  email?: string;
  password?: string;
  name?: string;
  photo?: string;
  birthYear?: number;
  gender?: Gender;
  role?: Role;
  verified?: boolean;
  online?: boolean;
};
