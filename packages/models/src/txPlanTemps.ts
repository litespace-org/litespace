import { Model } from "@/lib/model";
import { ITxPlanTemp } from "@litespace/types";
import { WithOptionalTx } from "@/query";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

const FIELD_TO_COLUMN = {
  txId: "tx_id",
  planId: "plan_id",
  planPeriod: "plan_period",
  createdAt: "created_at",
} satisfies Record<ITxPlanTemp.Field, ITxPlanTemp.Column>;

export class TxPlanTemps extends Model<
  ITxPlanTemp.Row,
  ITxPlanTemp.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "tx-plan-temp",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create({
    tx,
    ...payload
  }: WithOptionalTx<ITxPlanTemp.CreateModelPayload>): Promise<ITxPlanTemp.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        tx_id: payload.txId,
        plan_id: payload.planId,
        plan_period: payload.planPeriod,
        created_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Row not found; should never happen.");
    return this.from(row);
  }

  async findByTxId({
    tx,
    txId,
  }: WithOptionalTx<ITxPlanTemp.FindByTxIdModelPayload>): Promise<ITxPlanTemp.Self | null> {
    const row = await this.builder(tx)
      .select()
      .where(this.column("tx_id"), txId)
      .first();
    if (!row) return null;
    return this.from(row);
  }

  async delete({
    txId,
    tx,
  }: WithOptionalTx<ITxPlanTemp.DeleteModelPayload>): Promise<void> {
    await this.builder(tx).where(this.column("tx_id"), txId).delete();
  }
}

export const txPlanTemps = new TxPlanTemps();
