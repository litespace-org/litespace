export type Row = {
  id: number;
  sender_id: number;
  receiver_id: number;
  value: number;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  senderId: number;
  receiverId: number;
  value: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  senderId: number;
  receiverId: number;
  value: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "sender">>;

export type CreateApiPayload = Omit<CreatePayload, "senderId">;

export type UpdateApiPayload = UpdatePayload;
