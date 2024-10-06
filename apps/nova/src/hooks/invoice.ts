import { IInvoice } from "@litespace/types";
import { useMemo } from "react";

export function useInvoiceStatus(status: IInvoice.Status) {
  return useMemo(
    () => ({
      pending: status === IInvoice.Status.Pending,
      canceledByReceiver: status === IInvoice.Status.CanceledByReceiver,
      canceledByAdmin: status === IInvoice.Status.CanceledByAdmin,
      cancellationApprovedByAdmin:
        status === IInvoice.Status.CancellationApprovedByAdmin,
      fulfilled: status === IInvoice.Status.Fulfilled,
      rejected: status === IInvoice.Status.Rejected,
      updatedByReceiver: status === IInvoice.Status.UpdatedByReceiver,
    }),
    [status]
  );
}
