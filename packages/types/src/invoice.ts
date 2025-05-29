import type { Type as WithdrawMethod } from "@/withdrawMethod";
import { ExtractObjectKeys, Paginated } from "@/utils";
import { IFilter } from "@/index";

export const ReceiptFileKey = "receipt";

export const BANKS = [
  "CIB",
  "ALEX",
  "NBE",
  "MISR",
  "QNB",
  "MASHREQ",
  "AAIB",
] as const;
export type Bank = (typeof BANKS)[number];

export enum Status {
  PendingApproval = 0,
  PendingCancellation = 1,
  Canceled = 2,
  Approved = 3,
  Rejected = 4,
}

export type Self = {
  id: number;
  userId: number;
  method: WithdrawMethod;
  receiver: string; // {bank}:{account} / phone number / instapay username
  amount: number;
  status: Status;
  note: string | null;
  receipt: string | null;
  addressedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  method: WithdrawMethod;
  receiver: string;
  amount: number;
  status: Status;
  note: string | null;
  receipt: string | null;
  addressed_by: number | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  userId: number;
  method: WithdrawMethod;
  receiver: string;
  amount: number;
  note?: string | null;
};
export type CreateApiPayload = Omit<CreatePayload, "userId">;
export type CreateApiPayloadResponse = Self;

export type UpdatePayload = {
  status?: Status;
  receipt?: string;
  addressedBy?: number;
  note?: string;
};
export type UpdateApiPayload = { status?: Status; note?: string };
export type UpdateApiParams = { invoiceId: number };

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

export type FindInvoicesQuery = IFilter.Pagination & {
  users?: number[];
  methods?: WithdrawMethod[];
  statuses?: Status[];
  receipt?: boolean;
  orderBy?: ExtractObjectKeys<Row, "amount" | "created_at" | "updated_at">;
  orderDirection?: IFilter.OrderDirection;
};

export type FindStatsParams = { tutorId: number };
