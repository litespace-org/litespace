import { Paginated } from "@/utils";
import { SkippablePagination } from "@/filter";
import { IAvailabilitySlot, IFilter, IUser } from ".";

export enum Purpose {
  General = 1,
  Lesson = 2,
  Interview = 3,
  DemoSession = 4,
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

export type FindModelQuery<T extends Field = Field> =
  IFilter.SkippablePagination & {
    ids?: number[];
    execludeSlots?: number[];
    userIds?: number[];
    /**
     * filter users further by roles
     */
    roles?: IUser.Role[];
    start?: IFilter.Date;
    end?: IFilter.Date;
    createdAt?: IFilter.Date;
    deleted?: boolean;
    purposes?: IAvailabilitySlot.Purpose[];
    select?: T[];
  };

// API Payloads / Queries
export type FindAvailabilitySlotsApiQuery = SkippablePagination & {
  userIds?: number[];
  roles?: IUser.Role[];
  purposes?: Purpose[];
  after?: string;
  before?: string;
};

export type CreateAction = {
  type: "create";
  start: string;
  end: string;
  purpose: Purpose;
};

export type UpdateAction = {
  type: "update";
  id: number;
  start?: string;
  end?: string;
  purpose?: Purpose;
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
