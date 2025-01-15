import { Paginated } from "@/utils";
import { SkippablePagination } from "@/filter";

export type Self = {
  id: number;
  userId: number;
  start: string;
  end: string;
  deleted: boolean;
  createAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  user_id: number;
  start: Date;
  end: Date;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreatePayload = {
  userId: number;
  start: string;
  end: string;
};

export type UpdatePayload = {
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
  after?: string;
  before?: string;
};

export type CreateAction = {
  action: "create";
  start: string;
  end: string;
};

export type UpdateAction = {
  action: "update";
  id: number;
  start?: string;
  end?: string;
};

export type DeleteAction = {
  action: "delete";
  id: number;
};

export type Action = CreateAction | UpdateAction | DeleteAction;

// API Requests
export type SetAvailabilitySlotsApiPayload = {
  slots: Array<CreateAction | UpdateAction | DeleteAction>;
};

// API Responses
export type FindAvailabilitySlotsApiResponse = {
  slots: Paginated<Self>;
  subslots: SubSlot[];
};
