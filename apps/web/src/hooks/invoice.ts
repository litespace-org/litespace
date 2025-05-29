import { IInvoice } from "@litespace/types";
import { useMemo } from "react";

export function useInvoiceStatus(status: IInvoice.Status) {
  return useMemo(
    () => ({
      pendingApproval: status === IInvoice.Status.PendingApproval,
      PendingCancellation: status === IInvoice.Status.PendingCancellation,
      approved: status === IInvoice.Status.Approved,
      canceled: status === IInvoice.Status.Canceled,
      rejected: status === IInvoice.Status.Rejected,
    }),
    [status]
  );
}
