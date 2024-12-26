export type Self = {
  id: number;
  userId: number;
  start: string;
  end: string;
  createAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  start: Date;
  end: Date;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  userId: number;
  start: string;
  end: string;
};

export type UpdatePayload = {
  start: string;
  end: string;
};

