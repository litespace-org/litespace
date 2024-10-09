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
