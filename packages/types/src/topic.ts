import { ExtractObjectKeys } from "@/utils";
import { IFilter } from "@/index";

export type Self = {
  id: number;
  name: { ar: string; en: string };
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  name_ar: string;
  name_en: string;
  created_at: Date;
  updated_at: Date;
};

export type UserTopicsRow = {
  user_id: number;
  topic_id: number;
};

export type CreatePayload = {
  name: { ar: string; en: string };
};

export type CreateApiPayload = CreatePayload;

/**
 * At least one name must be provided.
 */
export type UpdatePayload = {
  arabicName?: string;
  englishName?: string;
};

export type FindTopicsQueryFilter = IFilter.Pagination & {
  name?: string;
  orderBy: ExtractObjectKeys<
    Row,
    "name_ar" | "name_en" | "created_at" | "updated_at"
  >;
  orderDirection: IFilter.OrderDirection;
};
