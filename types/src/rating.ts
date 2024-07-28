export type Self = {
  id: number;
  raterId: number;
  rateeId: number;
  value: number;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  rater_id: number;
  ratee_id: number;
  value: number;
  feedback: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  raterId: number;
  rateeId: number;
  value: number;
  feedback: string | null;
};

export type UpdatePayload = {
  value?: number;
  feedback?: string;
};
