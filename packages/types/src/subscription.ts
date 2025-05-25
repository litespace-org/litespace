import { IFilter, IPlan, Paginated } from "@/index";

export type Row = {
  id: number;
  user_id: number;
  plan_id: number;
  tx_id: number;
  period: IPlan.Period;
  weekly_minutes: number;
  start: Date;
  end: Date;
  extended_by: number | null;
  terminated_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  /**
   * The id of the subscription row in the database.
   */
  id: number;
  /**
   * The id of the subscription owner.
   */
  userId: number;
  /**
   * The id of the plan that the user subscribed to.
   */
  planId: number;
  /**
   * The id of the transaction associated with the subscription.
   */
  txId: number;
  /**
   * The period of the subscription: either a month, three monthes, or a year.
   */
  period: IPlan.Period;
  weeklyMinutes: number;
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
  terminatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = Pick<
  Self,
  "userId" | "planId" | "txId" | "period" | "weeklyMinutes" | "start" | "end"
>;

export type UpdatePayload = Partial<Pick<Self, "extendedBy" | "terminatedAt">>;

export type ModelFindFilter = {
  ids?: number[];
  users?: number[];
  plans?: number[];
  periods?: IPlan.Period[];
  transactions?: number[];
  weeklyMinutes?:
    | number
    | { gte?: number; lte?: number; gt?: number; lt?: number };
  terminated?: boolean;
  extended?: boolean;
  start?: { after?: string; before?: string };
  end?: { after?: string; before?: string };
};

export type ModelFindQuery = IFilter.SkippablePagination & ModelFindFilter;

export type FindApiQuery = ModelFindQuery;

export type FindApiResponse = Paginated<Self>;

export type FindByIdApiResponse = Self;

export type FindUserSubscriptionApiResponse = {
  info: Self | null;
  remainingWeeklyMinutes: number;
};

export type FindUserSubscriptionApiQuery = {
  userId: number;
};
