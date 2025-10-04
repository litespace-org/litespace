export enum Status {
  Pending,
  Rejected,
  Processed,
}

export enum Method {
  BankTransfer,
  EWallet,
}

export type Row = {
  id: number;
  user_id: number;
  tx_id: number;
  status: Status;
  method: Method;
  address: string;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  userId: number;
  txId: number;
  status: Status;
  method: Method;
  address: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Field = keyof Self;

export type Column = keyof Row;

export type CreateModelPayload = {
  userId: number;
  txId: number;
  status: Status;
  method: Method;
  address: string;
};

export type UpdateModelPayload = {
  id: number;
  status: Status;
};
