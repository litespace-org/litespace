import { ILesson, IPlan } from "@/index";

export type Row = {
  tx_id: number;
  tutor_id: number;
  slot_id: IPlan.Period;
  start: Date;
  duration: ILesson.Duration;
  created_at: Date;
};

export type Self = {
  txId: number;
  tutorId: number;
  slotId: IPlan.Period;
  start: string;
  duration: ILesson.Duration;
  createdAt: string;
};

export type Field = keyof Self;

export type Column = keyof Row;

export type CreateModelPayload = {
  txId: number;
  tutorId: number;
  slotId: number;
  start: string;
  duration: ILesson.Duration;
};

export type DeleteModelPayload = {
  txId: number;
};

export type FindByTxIdModelPayload = {
  txId: number;
};
