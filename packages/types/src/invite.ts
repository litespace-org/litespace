import { MappedRecordAttributes, RecordAttributes } from "@/utils";

export type Row = {
  id: number;
  email: string;
  plan_id: number;
  accepted_at: Date | null;
  expires_at: Date;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  email: string;
  planId: number;
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type SelectableSelf = { id: number; email: string; planId: number };

export type Attributed = SelectableSelf &
  RecordAttributes & {
    expiresAt: Date;
    acceptedAt: Date | null;
  };

export type MappedAttributes = SelectableSelf &
  MappedRecordAttributes & {
    expiresAt: string;
    acceptedAt: string | null;
  };

export type CreatePayload = {
  email: string;
  planId: number;
  expiresAt: string;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">> & {
  updatedBy: number;
};

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = Omit<UpdatePayload, "updatedBy">;
