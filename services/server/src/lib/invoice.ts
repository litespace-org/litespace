import { invoices, lessons, withdrawMethods } from "@litespace/models";
import { isValidWithdrawMethod } from "@litespace/sol/withdrawMethod";
import { IInvoice } from "@litespace/types";

/**
 * Total tutor "past" earnings.
 *
 * Canceled lessons are not included.
 */
async function getPastIncome(userId: number) {
  return await lessons.sumPrice({
    users: [userId],
    canceled: false,
    future: false,
  });
}

async function getTotalInvoices(userId: number) {
  return await invoices.sumAmounts({ users: [userId], pending: true });
}

/**
 * What the tutor can withdraw from the platform.
 *
 * It is equal to the difference between all past income (earnings) and his
 * total invoices.
 *
 * - Future income is not included as it is not spendable yet.
 * - Pending invoices is included in the calculation to pervent
 *   douple-spending problem.
 */
export async function getSpendableFunds(userId: number): Promise<number> {
  const [pastIncome, totalInvoices] = await Promise.all([
    getPastIncome(userId),
    getTotalInvoices(userId),
  ]);
  const spendable = pastIncome - totalInvoices;
  return spendable;
}

export async function isValidInvoice({
  payload,
  userId,
  change = 0,
}: {
  userId: number;
  payload: IInvoice.UpdateRequest;
  change?: number;
}) {
  const [spendable, withdrawMethod] = await Promise.all([
    getSpendableFunds(userId),
    withdrawMethods.findByType(payload.method),
  ]);
  const adjusted = spendable + change;
  const amount = payload.amount;
  const validAmount =
    amount <= adjusted &&
    !!withdrawMethod &&
    isValidWithdrawMethod(amount, withdrawMethod);

  // todo: verify receiver field
  // bank => account number
  // instapay => username
  // wallet => phone number that starts with "010", "011", "015"
  // verification should go to the "sol" lib and later be used by the client and the server.

  return validAmount;
}
