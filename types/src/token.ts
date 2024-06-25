export type Row = {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  userId: number;
  hash: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  userId: number;
  expiresAt: Date;
  hash: string;
};
