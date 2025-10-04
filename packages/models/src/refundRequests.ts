import { Model } from "@/lib/model";
import { IRefundRequest } from "@litespace/types";
import { WithOptionalTx } from "@/query";
import { first } from "lodash";

const FILED_TO_COLUMN = {
  id: "id",
  userId: "user_id",
  txId: "tx_id",
  status: "status",
  method: "method",
  address: "address",
  processedAt: "processed_at",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IRefundRequest.Field, IRefundRequest.Column>;

export class RefundRequests extends Model<
  IRefundRequest.Row,
  IRefundRequest.Self,
  typeof FILED_TO_COLUMN
> {
  constructor() {
    super({
      table: "refund_requests",
      fieldColumnMap: FILED_TO_COLUMN,
    });
  }

  async create({
    tx,
    userId,
    txId,
    status,
    method,
    address,
  }: WithOptionalTx<IRefundRequest.CreateModelPayload>): Promise<IRefundRequest.Self> {
    const rows = await this.builder(tx)
      .insert({
        user_id: userId,
        tx_id: txId,
        status,
        method,
        address,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Row not found. It should never happen.");
    return this.from(row);
  }

  async update({
    tx,
    id,
    status,
  }: WithOptionalTx<IRefundRequest.UpdateModelPayload>): Promise<void> {
    await this.builder(tx).update({ status }).where(this.column("id"), id);
  }
}

export const refundRequests = new RefundRequests();
