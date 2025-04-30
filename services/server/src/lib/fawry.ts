import { BaseRequestPayload, Customer } from "@/fawry/types/requests";
import { PaymentDetails, PaymentMethod } from "@/fawry/types/ancillaries";
import { fawryConfig } from "@/constants";
import { ITransaction } from "@litespace/types";
import { ORDER_STATUS_TO_TRANSACTION_STATUS } from "@/fawry/constants";
import { dayjs, PLAN_PERIOD_TO_MONTH_COUNT } from "@litespace/utils";
import { knex, plans, subscriptions, transactions } from "@litespace/models";

export function forgeFawryPayload({
  merchantRefNum,
  paymentMethod,
  chargeItems = [],
  description,
  signature,
  amount,
  customer,
}: {
  chargeItems?: BaseRequestPayload["chargeItems"];
  paymentMethod: PaymentMethod;
  merchantRefNum: number;
  description: string;
  signature: string;
  customer: Customer;
  amount: number;
}): BaseRequestPayload {
  return {
    merchantRefNum,
    paymentMethod,
    customerProfileId: customer.id,
    customerName: customer.name,
    customerMobile: customer.phone,
    customerEmail: customer.email,
    chargeItems,
    description,
    currencyCode: "EGP",
    language: "ar-eg",
    merchantCode: fawryConfig.merchantCode,
    signature,
    amount,
  };
}

/**
 * this function shall be used by handlers to sync the transaction status
 * with the order status in fawry db. It returns false in case it's already synced.
 * NOTE: it takes care of the side effects appertain to the transaction status change.
 */
export async function syncFawryStatus({
  payment,
  transaction,
}: {
  payment: PaymentDetails;
  transaction: ITransaction.Self;
}): Promise<boolean> {
  const status = ORDER_STATUS_TO_TRANSACTION_STATUS[payment.orderStatus];

  if (status === transaction.status) return false;

  const plan = await plans.findById(transaction.planId);
  if (!plan) throw new Error("Plan not found; should never happen");

  const monthCount = PLAN_PERIOD_TO_MONTH_COUNT[transaction.planPeriod];
  const subscription = await subscriptions.findByTxId(transaction.id);

  await knex.transaction(async (tx) => {
    await transactions.update(
      transaction.id,
      {
        status,
        providerRefNum: Number(payment.fawryRefNumber),
      },
      tx
    );

    const paid = status === ITransaction.Status.Paid;

    // terminate subscription in case the tx was canceled, refunded, or failed.
    if (subscription && !paid)
      return await subscriptions.update(subscription.id, {
        terminatedAt: dayjs.utc().toISOString(),
      });

    if (paid && !subscription) {
      // Default to now in case the payment time is missing.
      const start = dayjs.utc(payment.paymentTime) || dayjs.utc();
      const end = start.add(monthCount, "month");
      return subscriptions.create({
        tx,
        txId: transaction.id,
        period: transaction.planPeriod,
        planId: transaction.planId,
        weeklyMinutes: plan.weeklyMinutes,
        userId: transaction.userId,
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  });

  return true;
}
