import { Paginated } from "@/utils";

export enum Period {
  Month,
  Quarter,
  Year,
}

export type PeriodLiteral = "month" | "quarter" | "year";

export type Row = {
  id: number;
  weekly_minutes: number;
  base_monthly_price: number;
  month_discount: number;
  quarter_discount: number;
  year_discount: number;
  for_invites_only: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  weeklyMinutes: number;
  /**
   * Scaled montly price in EGP.
   *
   * @example 1000_00 (1000.00 EGP)
   *
   * @note unscale using `price.unscale`
   * @note scale using `price.scale`
   */
  baseMonthlyPrice: number;
  /**
   * Scaled month-discount percentage.
   *
   * @note scale using `percentage.scale`
   * @note unscale using `percentage.unscale`
   */
  monthDiscount: number;
  /**
   * Scaled quarter-discount percentage.
   *
   * @note scale using `percentage.scale`
   * @note unscale using `percentage.unscale`
   */
  quarterDiscount: number;
  /**
   * Scaled year-discount percentage.
   *
   * @note scale using `percentage.scale`
   * @note unscale using `percentage.unscale`
   */
  yearDiscount: number;
  forInvitesOnly: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  weeklyMinutes: number;
  baseMonthlyPrice: number;
  monthDiscount: number;
  quarterDiscount: number;
  yearDiscount: number;
  forInvitesOnly: boolean;
  active: boolean;
};

export type UpdatePayload = Partial<CreatePayload>;

export type CreateApiPayload = CreatePayload;

export type UpdateApiPayload = UpdatePayload;

export type FindPlansApiResponse = Paginated<Self>;
