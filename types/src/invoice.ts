import type { Type as WithdrawMethod } from "@/withdrawMethod";
import { Paginated } from "@/utils";
import { IFilter } from ".";

export enum Status {
  Pending = "pending",
  UpdatedByReceiver = "updated-by-receiver",
  CanceledByReceiver = "canceled-by-receiver",
  CanceledByAdmin = "canceled-by-admin",
  CancellationApprovedByAdmin = "cancellation-approved-by-admin",
  Fulfilled = "fulfilled",
  Rejected = "rejected",
}

export type UpdateRequest = {
  method: WithdrawMethod;
  receiver: string;
  bank: string | null;
  amount: number;
};

export type Self = {
  id: number;
  userId: number;
  method: WithdrawMethod;
  receiver: string;
  bank: string | null;
  amount: number;
  update: UpdateRequest | null;
  status: Status;
  note: string | null;
  attachment: string | null;
  addressedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  method: WithdrawMethod;
  receiver: string;
  bank: string | null;
  amount: number;
  update: string | null;
  status: Status;
  note: string | null;
  attachment: string | null;
  addressed_by: number | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  userId: number;
  method: WithdrawMethod;
  receiver: string;
  bank: string | null;
  amount: number;
};

export type CreateApiPayload = Omit<CreatePayload, "userId">;

export type UpdatePayload = {
  updateRequest?: UpdateRequest | null;
  method?: WithdrawMethod;
  receiver?: string;
  bank?: string | null;
  amount?: number;
  status?: Status;
  note?: string | null;
  attachment?: string | null;
  addressedBy?: number | null;
};

export type UpdateApiPayload = {
  updateRequest?: UpdateRequest;
  status?: Status;
  note?: string | null;
};

export type UpdateByReceiverApiPayload = {
  updateRequest?: UpdateRequest;
  cancel?: boolean;
};

export type UpdateByAdminApiPayload = {
  status?: Status;
  note?: string;
};

export type FindInvoicesApiResponse = Paginated<Self>;

export type StatsApiResponse = {
  income: {
    total: number;
    future: number;
    past: number;
  };
  invoices: {
    total: number;
    fulfilled: number;
    pending: number;
  };
  spendable: number;
};

export type CancelApiPayload = {
  note?: string;
};

export type FindInvoicesParams = IFilter.Pagination & { userId?: number };
