export type Self = {
  id: number;
  tutorId: number;
  studentId: number;
  value: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  tutor_id: number;
  student_id: number;
  value: number;
  note: string | null;
  created_at: Date;
  updated_at: Date;
};
