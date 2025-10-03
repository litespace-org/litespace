import { IFilter, IPlan, Paginated } from "@/index";

export enum Type {
  Subscription,
  PaidLesson,
}

export enum Status {
  New,
  Paid,
  Canceled,
  Refunded,
  Expired,
  PartialRefunded,
  Failed,
  Processed,
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
  amount: number;
  status: Status;
  type: Type;
  payment_method: PaymentMethod;
  provider_ref_num: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Self = {
  id: number;
  userId: number;
  /**
   * the price, with two decimal point, represeted as an integer (multiplies by 100)
   */
  amount: number;
  status: Status;
  type: Type;
  paymentMethod: PaymentMethod;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum: string | null;
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
  providerRefNums?: Array<string | null>;
  after?: string;
  before?: string;
};

export type FindQueryModel = IFilter.SkippablePagination & FindFilterModel;

export type FindApiQuery = FindQueryModel;

export type FindApiResponse = Paginated<Self>;

export type FindLastApiResponse = Self | null;

export type FindByIdApiResponse = Self;

export type CreatePayload = {
  userId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  type: Type;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum: string | null;
  status?: Status;
};

export type UpdatePayload = {
  status?: Status;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum?: string;
};
