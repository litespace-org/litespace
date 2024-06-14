export type Row = {
  id: number;
  code: string;
  full_month_discount: number;
  full_quarter_discount: number;
  half_year_discount: number;
  full_year_discount: number;
  expires_at: Date;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
};

export type Self = {
  id: number;
  code: string;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  expiresAt: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
};

export type CreatePayload = {
  code: string;
  fullMonthDiscount: number;
  fullQuarterDiscount: number;
  halfYearDiscount: number;
  fullYearDiscount: number;
  expiresAt: string;
  createdBy: number;
};

export type UpdatePayload = Partial<Omit<CreatePayload, "createdBy">>;

export type CreateApiPayload = Omit<CreatePayload, "createdBy">;

export type UpdateApiPayload = UpdatePayload;
