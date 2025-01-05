import { Paginated } from "@/utils";

export type Self = {
  id: number;
  userId: number;
  roomId: number;
  text: string;
  read: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  room_id: number;
  text: string;
  read: boolean;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  userId: number;
  roomId: number;
  text: string;
};

export type UpdatePayload = {
  text?: string;
};

export type FindRoomMessagesApiResponse = Paginated<Self>;

export type MessageState = "seen" | "sent" | "pending" | "error" | undefined;

export type ClientSideMessage = Self & {
  messageState?: MessageState;
  refId?: string;
};
