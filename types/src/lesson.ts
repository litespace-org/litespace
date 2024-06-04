export type Row = {
  id: number;
  tutor_id: number;
  student_id: number;
  slot_id: number;
  zoom_meeting_id: number;
  start: Date;
  duration: number;
  meeting_url: string;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  tutorId: number;
  studentId: number;
  slotId: number;
  zoomMeetingId: number;
  start: string;
  duration: number;
  meetingUrl: string;
  createdAt: string;
  updatedAt: string;
};
