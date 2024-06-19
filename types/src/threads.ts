import { MappedRecordAttributes, RecordAttributes } from "@/utils";

export type Row = {
  id: number;
  report_id: number;
  message: string;
  draft: boolean;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  reportId: number;
  message: string;
  draft: boolean;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type SelectableSelf = Omit<
  Self,
  "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;

export type Attributed = SelectableSelf & RecordAttributes;

export type MappedAttributes = SelectableSelf & MappedRecordAttributes;

export type CreatePayload = {
  reportId: number;
  message: string;
  draft: boolean;
  createdBy: number;
};

export type UpdatePayload = {
  draft?: boolean;
  message?: string;
  updatedBy: number;
};

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = Omit<UpdatePayload, "updatedBy">;
