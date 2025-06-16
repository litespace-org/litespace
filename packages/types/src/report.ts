import { IFilter } from "@/index";
import { Paginated } from "@/utils";

export enum AssetFileName {
  Screenshot = "screenshot",
  Log = "log",
}

export type Row = {
  id: number;
  user_id: number | null;
  title: string;
  description: string;
  screenshot: string | null;
  log: string | null;
  resolved: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Column = keyof Row;

export type Self = {
  id: number;
  userId: number | null;
  title: string;
  description: string;
  screenshot: string | null;
  log: string | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Field = keyof Self;

export type CreateModelPayload = {
  userId: number;
  title: string;
  description: string;
  screenshot?: string;
  log?: string;
};

export type UpdateModelPayload = {
  id: number;
  resolved: boolean;
};

export type FindModelQuery<T extends Field> = IFilter.SkippablePagination & {
  ids?: number[];
  users?: number[];
  title?: string;
  description?: string;
  screenshot?: boolean;
  log?: boolean;
  resolved?: boolean;
  createdAt?: IFilter.Date;
  updatedAt?: IFilter.Date;
  select?: T[];
};

export type CreateApiPayload = {
  title: string;
  description: string;
};

export type CreateApiFiles = {
  screenshot?: Blob;
  log?: Blob;
};

export type UpdateApiPayload = {
  id: number;
  resolved: boolean;
};

export type FindApiPayload = FindModelQuery<Field>;

export type FindApiResponse = Paginated<Self>;
