import { IFilter, Paginated } from "@/index";

export type Row = {
  id: number;
  user_id: number;
  plan_id: number;
  created_by: number;
  created_at: Date;
  expires_at: Date;
};

export type Column = keyof Row;

export type Self = {
  id: number;
  userId: number;
  planId: number;
  createdBy: number;
  createdAt: string;
  expiresAt: string | null;
};

export type Field = keyof Self;

export type CreateModelPayload = {
  userIds: number[];
  planId: number;
  createdBy: number;
  expiresAt?: string;
};

export type UpdateModelPayload = {
  ids: number[];
  expiresAt?: string;
};

export type FindModelPayload<T extends Field = Field> = {
  ids?: number[];
  userIds?: number[];
  planIds?: number[];
  createdBy?: number[];
  expiresAt?: IFilter.Date;
  select?: T[];
};

export type CreateApiPayload = {
  userIds: number[];
  planId: number;
  createdBy: number;
  expiresAt?: string;
};

export type CreateApiResponse = Self;

export type UpdateApiPayload = {
  ids: number[];
  expiresAt?: string;
};

export type UpdateApiResponse = unknown;

export type FindApiQuery = IFilter.SkippablePagination & {
  ids?: number[];
  userIds?: number[];
  planIds?: number[];
  createdBy?: number[];
  expiresAt?: IFilter.Date;
};

export type FindApiResponse = Paginated<Self>;
