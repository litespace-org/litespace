import { destructureInvoiceStatus } from "@/components/utils/invoice";
import { IInvoice } from "@litespace/types";
import { useMemo } from "react";

export function useInvoiceStatus(status: IInvoice.Status) {
  return useMemo(() => destructureInvoiceStatus(status), [status]);
}
