import { TRANSACTION_FEES } from "@/constants";
import { lessons } from "@litespace/models";
import { ITransaction } from "@litespace/types";
import { price } from "@litespace/utils";
import { max } from "lodash";

/**
 * as described here: https://handbook.litespace.org/s/business/p/refund-policy-oc66GtTqeX
 */
export async function calcRefundPrice({
  userId,
  tx,
}: {
  userId: number;
  tx: ITransaction.Self;
}): Promise<number> {
  const paidAmount = price.unscale(tx.amount);

  if (tx.type === ITransaction.Type.PaidLesson)
    return max([paidAmount - TRANSACTION_FEES, 0]) || 0;

  // if the tx of type paid-plan
  const fullLessonsPriceScaled = await lessons.sumPrice({
    users: [userId],
    future: false,
    canceled: false,
    reported: false,
  });

  const refundAmount =
    paidAmount - price.unscale(fullLessonsPriceScaled) - TRANSACTION_FEES;
  return max([refundAmount, 0]) || 0;
}
