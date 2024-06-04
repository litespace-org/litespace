export enum Repeat {
  No = "no",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

export type Self = {
  id: number;
  tutorId: number;
  title: string;
  description: string;
  weekday: number;
  time: { start: string; end: string };
  date: { start: string; end?: string };
  repeat: Repeat;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  tutor_id: number;
  title: string;
  description: string;
  weekday: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string | null;
  repeat: Repeat;
  created_at: Date;
  updated_at: Date;
};

export type Discrete = {
  id: number;
  tutorId: number;
  title: string;
  description: string;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
};
