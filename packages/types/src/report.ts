import { MappedRecordAttributes, RecordAttributes } from "@/utils";

export type Row = {
  id: number;
  title: string;
  description: string;
  category: string;
  resolved: boolean;
  resolved_at: Date | null;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  title: string;
  description: string;
  category: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type SelectableSelf = Omit<
  Self,
  "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "resolvedAt"
>;

export type Attributed = SelectableSelf &
  RecordAttributes & {
    resolvedAt: Date | null;
  };

export type MappedAttributes = SelectableSelf &
  MappedRecordAttributes & {
    resolvedAt: string | null;
  };

export type CreatePayload = {
  title: string;
  description: string;
  category: string;
  createdBy: number;
};

export type UpdatePayload = Partial<
  Omit<CreatePayload, "createdBy"> & { resolved: boolean }
> & {
  updatedBy: number;
};

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = Omit<UpdatePayload, "updatedBy">;
