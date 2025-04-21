import { IFilter, Paginated } from "@/index";

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
  MWallet,
  BankInstallment,
  Fawry,
}

export type Row = {
  id: number;
  user_id: number;
  /**
   * the price, with two decimal point, represeted as an integer (multiplies by 100)
   */
  amount: number;
  status: Status;
  payment_method: PaymentMethod;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  provider_ref_num: number | null;
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

export type ModelFindQuery = IFilter.SkippablePagination & ModelFindFilter;

export type FindQueryApi = ModelFindQuery;

export type ModelFindFilter = {
  ids?: number[];
  users?: number[];
  amount?: number | { gte: number; lte: number; gt: number; lt: number };
  statuses?: Status[];
  paymentMethods?: PaymentMethod[];
  providerRefNums?: Array<number | null>;
  after?: string;
  before?: string;
};

export type FindApiResponse = Paginated<Self>;

export type CreatePayload = {
  userId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum: number | null;
};

export type UpdatePayload = {
  status?: Status;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum?: number;
};
