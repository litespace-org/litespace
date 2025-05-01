import { OrderStatus, PaymentMethod } from "@/fawry/types/ancillaries";
import { ITransaction } from "@litespace/types";

export const ORDER_STATUS_TO_TRANSACTION_STATUS: Record<
  OrderStatus,
  ITransaction.Status
> = {
  NEW: ITransaction.Status.New,
  UNPAID: ITransaction.Status.New,
  PAID: ITransaction.Status.Paid,
  CANCELED: ITransaction.Status.Canceled,
  REFUNDED: ITransaction.Status.Refunded,
  EXPIRED: ITransaction.Status.Expired,
  PARTIAL_REFUNDED: ITransaction.Status.PartialRefunded,
  FAILED: ITransaction.Status.Failed,
};

export const TRANSACTION_PAYMENT_METHOD_TO_FAWRY_PAYMENT_METHOD: Record<
  PaymentMethod,
  ITransaction.PaymentMethod
> = {
  CARD: ITransaction.PaymentMethod.Card,
  MWALLET: ITransaction.PaymentMethod.EWallet,
  "Mobile Wallet": ITransaction.PaymentMethod.EWallet,
  PAYATFAWRY: ITransaction.PaymentMethod.Fawry,
};
