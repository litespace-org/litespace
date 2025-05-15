import { IFilter, IPlan, Paginated } from "@/index";

export enum Status {
  New,
  Paid,
  Canceled,
  Refunded,
  Expired,
  PartialRefunded,
  Failed,
}

export enum PaymentMethod {
  Card,
  EWallet,
  BankInstallment,
  Fawry,
}

export type Row = {
  id: number;
  user_id: number;
  plan_id: number;
  plan_period: IPlan.Period;
  amount: number;
  status: Status;
  payment_method: PaymentMethod;
  provider_ref_num: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  userId: number;
  planId: number;
  planPeriod: IPlan.Period;
  /**
   * the price, with two decimal point, represeted as an integer (multiplies by 100)
   */
  amount: number;
  status: Status;
  paymentMethod: PaymentMethod;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum: number | null;
  /**
   * ISO datetime
   */
  createdAt: string;
  /**
   * ISO datetime
   */
  updatedAt: string;
};

export type FindFilterModel = {
  ids?: number[];
  users?: number[];
  plans?: number[];
  planPeriods?: IPlan.Period[];
  amount?: number | { gte: number; lte: number; gt: number; lt: number };
  statuses?: Status[];
  paymentMethods?: PaymentMethod[];
  providerRefNums?: Array<number | null>;
  after?: string;
  before?: string;
};

export type FindQueryModel = IFilter.SkippablePagination & FindFilterModel;

export type FindQueryApi = FindQueryModel;

export type FindApiResponse = Paginated<Self>;

export type FindLastApiResponse = Self | null;

export type FindByIdApiResponse = Self;

export type CreatePayload = {
  userId: number;
  planId: number;
  planPeriod: IPlan.Period;
  amount: number;
  paymentMethod: PaymentMethod;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum: number | null;
  status?: Status;
};

export type UpdatePayload = {
  status?: Status;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum?: number;
};
