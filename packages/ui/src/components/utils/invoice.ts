import { LocalId } from "@/locales";
import { IInvoice } from "@litespace/types";

const bankIdMap: Record<IInvoice.Bank, LocalId> = {
  CIB: "banks.labels.cib",
  ALEX: "banks.labels.alex",
  NBE: "banks.labels.nbe",
  QNB: "banks.labels.qnb",
  AAIB: "banks.labels.aaib",
  MISR: "banks.labels.misr",
  MASHREQ: "banks.labels.mashreq",
};

export function getBankIntlId(bank: IInvoice.Bank): LocalId {
  return bankIdMap[bank];
}

export function destructureInvoiceStatus(status: IInvoice.Status) {
  return {
    pendingAppoval: status === IInvoice.Status.PendingApproval,
    pendingCancellation: status === IInvoice.Status.PendingCancellation,
    canceled: status === IInvoice.Status.Canceled,
    approved: status === IInvoice.Status.Approved,
    rejected: status === IInvoice.Status.Rejected,
  };
}
