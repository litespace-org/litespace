export type Row = {
  id: number;
  weekly_minutes: number;
  full_month_price: number;
  full_quarter_price: number;
  half_year_price: number;
  full_year_price: number;
  full_month_discount: number;
  full_quarter_discount: number;
  half_year_discount: number;
  full_year_discount: number;
  for_invites_only: boolean;
  active: boolean;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  weeklyMinutes: number;
  fullMonthPrice: number;
  fullQuarterPrice: number;
  halfYearPrice: number;
  fullYearPrice: number;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  forInvitesOnly: boolean;
  active: boolean;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

type SelectableSelf = Omit<
  Self,
  "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;

/**
 * Attach updator and creator info to the plan object
 */
export type Attributed = SelectableSelf & {
  createdAt: Date;
  createdById: number;
  createdByEmail: string;
  createdByName: string;
  updatedAt: Date;
  updatedById: number;
  updatedByEmail: string;
  updatedByName: string;
};

export type MappedAttributes = SelectableSelf & {
  createdAt: string;
  createdBy: { id: number; email: string; name: string };
  updatedAt: string;
  updatedBy: { id: number; email: string; name: string };
};

export type CreatePayload = {
  weeklyMinutes: number;
  fullMonthPrice: number;
  fullQuarterPrice: number;
  halfYearPrice: number;
  fullYearPrice: number;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  forInvitesOnly: boolean;
  active: boolean;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">> & {
  updatedBy: number;
};

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = Omit<UpdatePayload, "updatedBy">;
