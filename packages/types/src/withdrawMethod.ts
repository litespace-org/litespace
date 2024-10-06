export enum Type {
  Wallet = "wallet",
  Bank = "bank",
  Instapay = "instapay",
}

export type Self = {
  type: Type;
  min: number;
  max: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  type: Type;
  min: number;
  max: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  type: Type;
  min: number;
  max: number;
  enabled: boolean;
};

export type UpdatePayload = {
  min?: number;
  max?: number;
  enabled?: boolean;
};
