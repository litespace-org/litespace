import { Paginated } from "@/utils";
import { SkippablePagination } from "@/filter";

export enum Purpose {
  General = 1,
  Lesson = 2,
  Interview = 3,
}

export type Self = {
  id: number;
  userId: number;
  purpose: Purpose;
  start: string;
  end: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  purpose: number;
  start: Date;
  end: Date;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Column = keyof Row;

export type Field = keyof Self;

export type CreatePayload = {
  userId: number;
  // TODO: use purpose in all over the codebase and alter this to unoptional
  purpose?: Purpose;
  start: string;
  end: string;
};

export type UpdatePayload = {
  purpose?: Purpose;
  start?: string;
  end?: string;
  deleted?: boolean;
};

export type Slot = {
  id: number;
  start: string;
  end: string;
};

export type SubSlot = {
  parent: number;
  start: string;
  end: string;
};

export type Base = {
  start: string;
  end: string;
};

export type GeneralSlot = Slot | SubSlot;

// API Payloads / Queries
export type FindAvailabilitySlotsApiQuery = SkippablePagination & {
  userId: number;
  purpose?: Purpose;
  after?: string;
  before?: string;
};

export type CreateAction = {
  type: "create";
  start: string;
  end: string;
};

export type UpdateAction = {
  type: "update";
  id: number;
  start?: string;
  end?: string;
};

export type DeleteAction = {
  type: "delete";
  id: number;
};

export type Action = CreateAction | UpdateAction | DeleteAction;

// API Requests
export type SetAvailabilitySlotsApiPayload = {
  actions: Array<Action>;
};

// API Responses
export type FindAvailabilitySlotsApiResponse = {
  slots: Paginated<Self>;
  subslots: SubSlot[];
};

export type SetAvailabilitySlotsApiResponse = void;
