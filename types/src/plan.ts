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
  fullyearPrice: number;
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

export type Attributed = {
  id: number;
  weeklyMinutes: number;
  fullMonthPrice: number;
  fullQuarterPrice: number;
  halfYearPrice: number;
  fullyearPrice: number;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  forInvitesOnly: boolean;
  active: boolean;
  createdAt: string;
  createdById: number;
  createdByEmail: number;
  createdByName: number;
  updatedAt: string;
  updatedById: number;
  updatedByEmail: number;
  updatedByName: number;
};

export type CreatePayload = {
  weeklyMinutes: number;
  fullMonthPrice: number;
  fullQuarterPrice: number;
  halfYearPrice: number;
  fullyearPrice: number;
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
