import { environment } from "@/constants";
import dayjs from "@/lib/dayjs";
/**
 * @description  Generate random transaction reference id.
 */
export function genTxRid({
  transactionId,
  createdAt,
}: {
  transactionId: number;
  createdAt: string;
}): number {
  if (environment === "production") return transactionId;
  const seconds = dayjs.utc(createdAt).unix();
  const id = seconds.toString() + transactionId.toString();
  return Number(id);
}
