import { IFilter, Paginated } from ".";

export enum Period {
  Month,
  Quarter,
  Year,
}

export type Row = {
  id: number;
  user_id: number;
  plan_id: number;
  tx_id: number;
  period: Period;
  quota: number;
  start: Date;
  end: Date;
  extended_by: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  /**
   * The Id of the subscription row in the db.
   */
  id: number;
  /**
   * The id of the user of the subscription.
   */
  userId: number;
  /**
   * The id of the plan that the user subscribed to.
   */
  planId: number;
  /**
   * The id of the transaction that the user has proceeded to make the subscription.
   */
  txId: number;
  /**
   * The period of the subscription: either a month, three monthes, or a year.
   */
  period: Period;
  /**
   * The amount of remaining minutes in user subscription.
   * Note: it's being calculated by multiplying the subscription period
   * by the plan.weeklyMinutes.
   */
  quota: number;
  /**
   * The start date of the subscription.
   */
  start: string;
  /**
   * The end date of the subscription.
   */
  end: string;
  /**
   * The id of the extendee subscription.
   */
  extendedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = Pick<
  Self,
  "userId" | "planId" | "txId" | "period" | "quota"
>;

export type UpdatePayload = Pick<Self, "extendedBy">;

export type ModelFindFilter = {
  ids?: number[];
  users?: number[];
  plans?: number[];
  periods?: Period[];
  quota?: number | { gte?: number; lte?: number; gt?: number; lt?: number };
  extended?: boolean;
  start?: {
    after?: string;
    before?: string;
  };
  end?: {
    after?: string;
    before?: string;
  };
};

export type ModelFindQuery = IFilter.SkippablePagination & ModelFindFilter;

export type FindQueryApi = ModelFindQuery;
export type FindApiResponse = Paginated<Self>;
