export enum Repeat {
  No = "no",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

export type Self = {
  id: number;
  userId: number;
  title: string;
  weekday: number;
  time: { start: string; end: string };
  date: { start: string; end?: string };
  repeat: Repeat;
  createdAt: string;
  updatedAt: string;
};

export type ModifiedSelf = {
  id: number;
  userId: number;
  title: string;
  weekday: number;
  start: string;
  end: string | null;
  time: string;
  duration: number;
  repeat: Repeat;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  title: string;
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
  userId: number;
  title: string;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
};

export type SlotFilter = {
  start?: string;
  window?: number;
};

export type Unpacked = {
  day: string;
  slots: Discrete[];
};

export type CreateApiPayload = {
  title: string;
  time: { start: string; end: string };
  date: { start: string; end?: string };
  repeat: Repeat;
};
