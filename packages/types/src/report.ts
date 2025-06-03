import { IFilter } from "@/index";
import { Paginated } from "@/utils";

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

export type CreatePayload = {
  userId: number;
  title: string;
  description: string;
  screenshot?: string;
  log?: string;
};

export type UpdatePayload = {
  resolved: boolean;
};

export type FindModelQuery = IFilter.SkippablePagination & {
  ids?: number[];
  users?: number[];
  title?: string;
  description?: string;
  screenshot?: boolean;
  log?: boolean;
  resolved?: boolean;
  createdAt?: IFilter.Date;
  updatedAt?: IFilter.Date;
};

export type CreateApiPayload = {
  title: string;
  description: string;
  /**
   * An image encoded in base64
   */
  screenshot?: string;
  log?: string;
};

export type UpdateApiPayload = {
  resolved: boolean;
};

export type FindApiPayload = FindModelQuery;

export type FindApiResponse = Paginated<Self>;
