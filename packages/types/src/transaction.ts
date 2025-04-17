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
  EWallet,
  Bank,
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

export type FindQuery = IFilter.SkippablePagination & {
  id?: number;
  users?: number[];
  amount?: number;
  status?: Status;
  paymentMethod?: PaymentMethod;
  providerRefNum?: number | null;
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
