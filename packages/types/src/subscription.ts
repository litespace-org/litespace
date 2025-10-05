import { IFilter, IPlan, Paginated } from "@/index";
import { PaidLessonStatus } from "@/lesson";

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
  terminated_by: number | null;
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
  terminatedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = Pick<
  Self,
  "userId" | "planId" | "txId" | "period" | "weeklyMinutes" | "start" | "end"
>;

export type UpdatePayload = Partial<
  Pick<Self, "extendedBy" | "terminatedAt" | "terminatedBy">
>;

export type ModelFindFilter = {
  ids?: number[];
  users?: number[];
  plans?: number[];
  periods?: IPlan.Period[];
  transactions?: number[];
  weeklyMinutes?: IFilter.Numeric;
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
  paidLessonStatus: PaidLessonStatus;
};

export type FindUserSubscriptionApiQuery = {
  userId: number;
};

export type CancelApiPayload = {
  /**
   * subscription id to be canceled.
   * @NOTE: should only be provided by admins.
   */
  id?: number;
};

export type CancelApiResponse = {
  refundAmount: number;
};
