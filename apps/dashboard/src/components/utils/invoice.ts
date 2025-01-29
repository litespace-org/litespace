import { LocalId } from "@litespace/ui/locales";
import { IInvoice, IWithdrawMethod } from "@litespace/types";

export const withdrawMethodsIntlMap: Record<IWithdrawMethod.Type, LocalId> = {
  [IWithdrawMethod.Type.Wallet]: "withdraw.methods.wallet",
  [IWithdrawMethod.Type.Instapay]: "withdraw.methods.instapay",
  [IWithdrawMethod.Type.Bank]: "withdraw.methods.bank",
};

export const invoiceBankIntlMap: Record<IInvoice.Bank, LocalId> = {
  [IInvoice.Bank.Alex]: "banks.labels.alex",
  [IInvoice.Bank.Cib]: "banks.labels.cib",
};

export const invoiceStatusIntlMap: Record<IInvoice.Status, LocalId> = {
  [IInvoice.Status.Pending]: "invoices.admin.status.pending",
  [IInvoice.Status.UpdatedByReceiver]:
    "invoices.admin.status.updated-by-receiver",
  [IInvoice.Status.CanceledByReceiver]:
    "invoices.admin.status.canceled-by-receiver",
  [IInvoice.Status.CancellationApprovedByAdmin]:
    "invoices.admin.status.canceled-by-admin",
  [IInvoice.Status.Fulfilled]: "invoices.admin.status.fulfilled",
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
