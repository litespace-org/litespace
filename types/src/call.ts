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
  zoom_meeting_id: number;
  system_zoom_account_id: number;
  start: Date;
  duration: number;
  meeting_url: string;
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
  zoomMeetingId: number;
  systemZoomAccountId: number;
  start: string;
  duration: number;
  meetingUrl: string;
  note: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HostCall = Self & {
  attendeeId: number;
  attendeeEmail: string;
  attendeeName: string;
};

export enum Size {
  Short = "15",
  Long = "30",
}

export type CreateApiPayload = {
  type: Type;
  start: string;
  slotId: number;
  size: Size;
};

export type CreatePayload = Omit<
  Self,
  "id" | "createdAt" | "updatedAt" | "note" | "feedback"
>;
