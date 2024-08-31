import { IUser } from "@/index";

export type Row = {
  id: number;
  rule_id: number;
  start: Date;
  duration: number;
  canceled_by: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  ruleId: number;
  start: string;
  duration: number;
  canceledBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberRow = {
  user_id: number;
  call_id: number;
  host: boolean;
  note: string | null;
  feedback: string | null;
  rate: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Member = {
  userId: number;
  callId: number;
  host: boolean;
  note: string | null;
  feedback: string | null;
  rate: number | null;
  createAt: string;
  updatedAt: string;
};

export type PopuldatedMemberRow = {
  userId: number;
  callId: number;
  email: string | null;
  arabicName: string | null;
  englishName: string | null;
  photo: string | null;
  role: IUser.Role;
  note: string | null;
  feedback: string | null;
  rate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PopuldatedMember = {
  userId: number;
  callId: number;
  email: string | null;
  name: IUser.Name;
  photo: string | null;
  role: IUser.Role;
  note: string | null;
  feedback: string | null;
  rate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  ruleId: number;
  start: string;
  duration: Duration;
  memberIds: number[];
  hostId: number;
};

export enum Duration {
  Short = 15,
  Long = 30,
}

// export type HostCall = Self & {
//   attendeeId: number;
//   attendeeEmail: string | null;
//   attendeeNameAr: string | null;
//   attendeeNameEn: string | null;
// };

// export type AttendeeCall = Self & {
//   host: { email: string | null; name: IUser.Name };
// };

// export type AttendeeCallRow = Self & {
//   hostEmail: string;
//   hostNameAr: string;
//   hostNameEn: string;
// };

// export type CreateApiPayload = {
//   type: Type;
//   start: string;
//   ruleId: number;
//   duration: number;
// };

// export type CreatePayload = Omit<
//   Self,
//   "id" | "createdAt" | "updatedAt" | "note" | "feedback"
// >;
