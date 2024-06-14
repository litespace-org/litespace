export type Row = {
  id: number;
  title: string;
  description: string;
  category: string;
  addressed: boolean;
  addressed_at: Date;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  reporterId: number;
  title: string;
  description: string;
  category: string;
  addressed: boolean;
  addressedAt: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: number;
};

export type CreatePayload = {
  title: string;
  description: string;
  category: string;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">>;

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = UpdatePayload;
