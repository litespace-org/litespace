import { ICall, IUser } from "@/index";

export type Row = {
  id: number;
  call_id: number;
  canceled_by: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  callId: number;
  canceledBy: number | null;
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
};

export type CreateApiPayload = {
  tutorId: number;
  ruleId: number;
  start: string;
  duration: ICall.Duration;
};
