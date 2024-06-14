export type Row = {
  id: number;
  report_id: number;
  message: string;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  reportId: number;
  message: string;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type CreatePayload = {
  reportId: number;
  message: string;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">>;

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = UpdatePayload;
