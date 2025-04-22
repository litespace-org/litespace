import { environment } from "@/constants";
import dayjs from "@/lib/dayjs";

/**
 * @description
 * - In production, the merchant reference number is the transaction id.
 * - In staging and local, the merchant reference number is the transaction
 *   creation time in seconds + the transaction id.
 *
 * This is done to ensure uniqueness of transactions as we cannot re-use the
 * same transaction id twice as reference number with fawry. This can happen
 * with fawry if we flushed the database locally or on staging.
 *
 * In production, this will never happen as the transaction id is more than
 * enough to ensure uniqueness.
 *
 * @note
 * The max transaction id on local or staging is a 5 digit number (e.g., 99,999).
 * Beyond this number the encoded merchant reference number will be more than
 * `Number.MAX_SAFE_INTEGER`.
 */
export function encodeMerchantRefNumber({
  transactionId,
  createdAt,
}: {
  transactionId: number;
  createdAt: string;
}) {
  if (environment === "production") return transactionId;
  const seconds = dayjs.utc(createdAt).unix();
  const data = seconds + transactionId.toString();
  return Number(data);
}

export function decodeMerchantRefNumber(merchantRefNumber: string) {
  if (environment === "production") return Number(merchantRefNumber);
  /**
   * Remove the first **10 digits** (the transaction creation time in
   * **seconds**). The remaning number should be the transaction id.
   */
  const transactionId = merchantRefNumber.slice(10);
  return Number(transactionId);
}
