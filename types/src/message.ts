export type Self = {
  id: number;
  userId: number;
  roomId: number;
  body: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  room_id: number;
  body: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  userId: number;
  roomId: number;
  body: string;
};
