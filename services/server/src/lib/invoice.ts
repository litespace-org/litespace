import { invoices, lessons } from "@litespace/models";
import { IInvoice } from "@litespace/types";
import dayjs from "dayjs";

export async function calculateWithdrawableAmount(
  tutorId: number
): Promise<number> {
  const now = dayjs();

  const pastIncome = await lessons.sumPrice({
    users: [tutorId],
    canceled: false,
    reported: false,
    before: now.toISOString(),
  });

  const totalInvoices = await invoices.sumAmounts({
    users: [tutorId],
    status: [
      IInvoice.Status.Approved,
      IInvoice.Status.PendingApproval,
      IInvoice.Status.PendingCancellation,
    ],
  });

  return pastIncome - totalInvoices;
}
