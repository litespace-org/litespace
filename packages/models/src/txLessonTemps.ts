import { Model } from "@/lib/model";
import { ITxLessonTemp } from "@litespace/types";
import { WithOptionalTx } from "@/query";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

const FIELD_TO_COLUMN = {
  txId: "tx_id",
  tutorId: "tutor_id",
  slotId: "slot_id",
  start: "start",
  duration: "duration",
  createdAt: "created_at",
} satisfies Record<ITxLessonTemp.Field, ITxLessonTemp.Column>;

export class TxLessonTemps extends Model<
  ITxLessonTemp.Row,
  ITxLessonTemp.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "tx-lesson-temp",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create({
    tx,
    ...payload
  }: WithOptionalTx<ITxLessonTemp.CreateModelPayload>): Promise<ITxLessonTemp.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        tx_id: payload.txId,
        tutor_id: payload.tutorId,
        slot_id: payload.slotId,
        start: dayjs.utc(payload.start).toDate(),
        duration: payload.duration,
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
  }: WithOptionalTx<ITxLessonTemp.FindByTxIdModelPayload>): Promise<ITxLessonTemp.Self | null> {
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
  }: WithOptionalTx<ITxLessonTemp.DeleteModelPayload>): Promise<void> {
    await this.builder(tx).where(this.column("tx_id"), txId).delete();
  }
}

export const txLessonTemps = new TxLessonTemps();
