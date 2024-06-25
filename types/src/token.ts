export type Row = {
  id: number;
  user_id: number;
  expires_at: Date;
  token_hash: string;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  userId: number;
  expiresAt: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  userId: number;
  expiresAt: Date;
  hash: string;
};
