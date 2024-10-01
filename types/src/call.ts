import { IUser } from "@/index";

export enum RecordingStatus {
  Idle = "idle",
  Recording = "recording",
  Recorded = "recorded",
  Queued = "queued",
  Empty = "empty",
  Processing = "processing",
  Processed = "processed",
  ProcessingFailed = "processing-failed",
}

export type Row = {
  id: number;
  rule_id: number;
  start: Date;
  duration: number;
  canceled_by: number | null;
  canceled_at: Date | null;
  recording_status: RecordingStatus;
  processing_time: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  ruleId: number;
  start: string;
  duration: number;
  canceledBy: number | null;
  canceledAt: string | null;
  recordingStatus: RecordingStatus;
  processingTime: number | null;
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
  host: boolean;
  email: IUser.Row["email"];
  name: IUser.Row["name"];
  image: IUser.Row["image"];
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
  host: boolean;
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  image: IUser.Self["image"];
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
  duration: number;
  memberIds: number[];
  hostId: number;
};

export type UpdatePayload = {
  recordingStatus?: RecordingStatus;
  canceledBy?: number;
  processingTime?: number;
};

export type FindCallByIdApiResponse = {
  call: Self;
  members: PopuldatedMember[];
};

export type FindUserCallsApiResponse = {
  calls: Self[];
  members: Record<string, PopuldatedMember[]>;
};
