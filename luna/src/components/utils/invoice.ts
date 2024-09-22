import { LocalId } from "@/locales";
import { IInvoice } from "@litespace/types";

const bankIdMap: Record<IInvoice.Bank, LocalId> = {
  [IInvoice.Bank.Cib]: "banks.labels.cib",
  [IInvoice.Bank.Alex]: "banks.labels.alex",
};

export function getBankIntlId(bank: IInvoice.Bank): LocalId {
  return bankIdMap[bank];
}

export function destructureInvoiceStatus(status: IInvoice.Status) {
  return {
    pending: status === IInvoice.Status.Pending,
    canceledByReceiver: status === IInvoice.Status.CanceledByReceiver,
    cancellationApprovedByAdmin:
      status === IInvoice.Status.CancellationApprovedByAdmin,
    fulfilled: status === IInvoice.Status.Fulfilled,
    rejected: status === IInvoice.Status.Rejected,
    updatedByReceiver: status === IInvoice.Status.UpdatedByReceiver,
  };
}
