import { RecordAttributes, MappedRecordAttributes } from "@/utils";

export type Row = {
  id: number;
  code: string;
  plan_id: number;
  full_month_discount: number;
  full_quarter_discount: number;
  half_year_discount: number;
  full_year_discount: number;
  expires_at: Date;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  code: string;
  planId: number;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  expiresAt: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type SelectableSelf = Omit<
  Self,
  "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "expiresAt"
>;

export type Attributed = SelectableSelf &
  RecordAttributes & {
    expiresAt: Date;
  };

export type MappedAttributes = SelectableSelf &
  MappedRecordAttributes & {
    expiresAt: string;
  };

export type CreatePayload = {
  code: string;
  planId: number;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  expiresAt: string;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">> & {
  updatedBy: number;
};

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = Omit<UpdatePayload, "updatedBy">;
