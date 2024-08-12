import { IUser } from "@/index";

export enum Type {
  Lesson = "lesson",
  Interview = "interview",
}

export type Row = {
  id: number;
  type: Type;
  host_id: number;
  attendee_id: number;
  slot_id: number;
  start: Date;
  duration: number;
  note: string | null;
  feedback: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  type: Type;
  hostId: number;
  attendeeId: number;
  slotId: number;
  start: string;
  duration: number;
  note: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HostCall = Self & {
  attendeeId: number;
  attendeeEmail: string | null;
  attendeeNameAr: string | null;
  attendeeNameEn: string | null;
};

export type AttendeeCall = Self & {
  host: { email: string | null; name: IUser.Name };
};

export type AttendeeCallRow = Self & {
  hostEmail: string;
  hostNameAr: string;
  hostNameEn: string;
};

export type CreateApiPayload = {
  type: Type;
  start: string;
  slotId: number;
  duration: number;
};

export type CreatePayload = Omit<
  Self,
  "id" | "createdAt" | "updatedAt" | "note" | "feedback"
>;
