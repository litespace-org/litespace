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
  recording_status: RecordingStatus;
  processing_time: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  recordingStatus: RecordingStatus;
  processingTime: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberRow = {
  user_id: number;
  call_id: number;
};

export type Member = {
  userId: number;
  callId: number;
};

/**
 * @deprecated should be removed becuase of the new database models
 */
export type PopuldatedMemberRow = {
  user_id: number;
  call_id: number;
  email: IUser.Row["email"];
  name: IUser.Row["name"];
  image: IUser.Row["image"];
  role: IUser.Role;
};

export type PopuldatedMember = {
  userId: number;
  callId: number;
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  role: IUser.Role;
};

export type CreatePayload = {
  /**
   * At least one member is required to create the call.
   */
  members: [number, ...number[]];
};

export type UpdatePayload = {
  recordingStatus?: RecordingStatus;
  processingTime?: number;
};

/**
 * @deprecated should be removed
 */
export type FindCallByIdApiResponse = {
  call: Self;
  members: PopuldatedMember[];
};

/**
 * @deprecated should be removed
 */
export type FindUserCallsApiResponse = {
  calls: Self[];
  members: Record<string, PopuldatedMember[]>;
};
