import { ICall, IUser, Paginated } from "@/index";

export type Row = {
  id: number;
  call_id: number;
  price: number;
  canceled_by: number | null;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  callId: number;
  price: number;
  canceledBy: number | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberRow = {
  user_id: number;
  lesson_id: number;
  host: boolean;
};

export type Member = {
  userId: number;
  lessonId: number;
  host: boolean;
};

export type PopuldatedMemberRow = {
  userId: number;
  lessonId: number;
  host: boolean;
  email: string | null;
  arabicName: string | null;
  englishName: string | null;
  photo: string | null;
  role: IUser.Role;
  createdAt: Date;
  updatedAt: Date;
};

export type PopuldatedMember = {
  userId: number;
  lessonId: number;
  host: boolean;
  email: string | null;
  name: IUser.Name;
  photo: string | null;
  role: IUser.Role;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  callId: number;
  hostId: number;
  members: number[];
  price: number;
};

export type CreateApiPayload = {
  tutorId: number;
  ruleId: number;
  start: string;
  duration: Duration;
};

export type FindUserLessonsApiResponse = Paginated<{
  lesson: Self;
  members: PopuldatedMember[];
  call: ICall.Self;
}>;

export type CreateApiResponse = {
  lesson: Self;
  call: ICall.Self;
};

export enum Duration {
  Short = 15,
  Long = 30,
}
