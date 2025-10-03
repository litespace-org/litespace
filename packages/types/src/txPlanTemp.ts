import { IPlan } from "@/index";

export type Row = {
  tx_id: number;
  plan_id: number;
  plan_period: IPlan.Period;
  created_at: Date;
};

export type Self = {
  txId: number;
  planId: number;
  planPeriod: IPlan.Period;
  createdAt: Date;
};

export type Field = keyof Self;

export type Column = keyof Row;

export type CreateModelPayload = {
  txId: number;
  planId: number;
  planPeriod: IPlan.Period;
};

export type DeleteModelPayload = {
  txId: number;
};

export type FindByTxIdModelPayload = {
  txId: number;
};
