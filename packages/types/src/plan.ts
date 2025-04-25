import { Paginated } from "@/utils";

export type Row = {
  id: number;
  weekly_minutes: number;
  base_monthly_price: number; // scaled
  month_discount: number; // scaled
  quarter_discount: number; // scaled
  year_discount: number; // scaled
  for_invites_only: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  weeklyMinutes: number;
  baseMonthlyPrice: number; // scaled
  monthDiscount: number; // scaled
  quarterDiscount: number; // scaled
  yearDiscount: number; // scaled
  forInvitesOnly: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayload = {
  weeklyMinutes: number;
  baseMonthlyPrice: number; // scaled
  monthDiscount: number; // scaled
  quarterDiscount: number; // scaled
  yearDiscount: number; // scaled
  forInvitesOnly: boolean;
  active: boolean;
};

export type UpdatePayload = Partial<CreatePayload>;

export type CreateApiPayload = CreatePayload;

export type UpdateApiPayload = UpdatePayload;

export type FindPlansApiResponse = Paginated<Self>;
