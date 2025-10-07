import { IFilter, Paginated } from "@/index";

export type TypeLiteral = "paid-plan" | "paid-lesson";

export enum Type {
  PaidPlan,
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
  fees: number;
  phone: string;
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
  fees: number;
  phone: string;
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

export type Field = keyof Self;

export type Column = keyof Row;

export type FindFilterModel = {
  ids?: IFilter.List<number>;
  users?: IFilter.List<number>;
  amount?: IFilter.Numeric;
  statuses?: IFilter.List<Status>;
  types?: IFilter.List<Type>;
  paymentMethods?: IFilter.List<PaymentMethod>;
  providerRefNums?: IFilter.NullableList<string>;
  createdAt?: IFilter.Date;
  updatedAt?: IFilter.Date;
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
  phone: string;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum: string | null;
  fees?: number;
  status?: Status;
};

export type UpdateModelPayload = {
  id: number;
  status?: Status;
  fees?: number;
  /**
   * this is defined to map between transactions and ref numbers
   * from third party services. e.g. fawry orderRefNum.
   */
  providerRefNum?: string;
};
