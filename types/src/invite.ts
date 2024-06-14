export type Row = {
  id: number;
  email: string;
  plan_id: number;
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
  expiresAt: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

export type CreatePayload = {
  email: string;
  planId: number;
  expiresAt: string;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">>;

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = UpdatePayload;
