export type Self = {
  id: number;
  userId: number;
  roomId: number;
  replyId: number | null;
  body: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  room_id: number;
  reply_id: number | null;
  body: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
};
