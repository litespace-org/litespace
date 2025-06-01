import { LocalId } from "@litespace/ui/locales";
import { IInvoice } from "@litespace/types";

export const withdrawMethodsIntlMap: Record<IInvoice.WithdrawMethod, LocalId> =
  {
    [IInvoice.WithdrawMethod.Wallet]: "withdraw.methods.wallet",
    [IInvoice.WithdrawMethod.Instapay]: "withdraw.methods.instapay",
    [IInvoice.WithdrawMethod.Bank]: "withdraw.methods.bank",
  };

export const invoiceBankIntlMap: Record<IInvoice.Bank, LocalId> = {
  ALEX: "banks.labels.alex",
  CIB: "banks.labels.cib",
  NBE: "banks.labels.nbe",
  QNB: "banks.labels.qnb",
  AAIB: "banks.labels.aaib",
  MISR: "banks.labels.misr",
  MASHREQ: "banks.labels.mashreq",
};

export const invoiceStatusIntlMap: Record<IInvoice.Status, LocalId> = {
  [IInvoice.Status.PendingApproval]: "invoices.admin.status.pending",
  [IInvoice.Status.PendingCancellation]:
    "invoices.admin.status.canceled-by-receiver",
  [IInvoice.Status.Canceled]: "invoices.admin.status.canceled-by-admin",
  [IInvoice.Status.Approved]: "invoices.admin.status.fulfilled",
  [IInvoice.Status.Rejected]: "invoices.admin.status.rejected",
};

export const invoiceOrderIntlMap: Record<
  "amount" | "created_at" | "updated_at" | "bank",
  LocalId
> = {
  amount: "dashboard.invoices.amount",
  created_at: "dashboard.invoices.createdAt",
  updated_at: "dashboard.invoices.updatedAt",
  bank: "dashboard.invoices.bank",
};
