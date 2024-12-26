import { IAvailabilitySlot } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { first, isEmpty } from "lodash";
import { knex, column, WithOptionalTx } from "@/query";

type SearchFilter = {
  /**
   * User ids to be included in the search query.
   */
  users?: number[];
  /**
   * Start date time (ISO datetime format)
   * All slots after (or the same as) this date will be included.
   */
  after?: string;
  /**
   * End date time (ISO datetime format)
   * All slots before (or the same as) this date will be included.
   */
  before?: string;
};

export class AvailabilitySlots {
  table = "availability_slots" as const;

  async create(
    payloads: IAvailabilitySlot.CreatePayload[],
    tx?: Knex.Transaction
  ): Promise<IAvailabilitySlot.Self[]> {
    if (isEmpty(payloads)) throw new Error("At least one payload must be passed.");

    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert(payloads.map(payload => ({
        user_id: payload.userId,
        start: dayjs.utc(payload.start).toDate(),
        end: dayjs.utc(payload.end).toDate(),
        created_at: now,
        updated_at: now,
      })))
      .returning("*");

    return rows.map(row => this.from(row));
  }

  async delete(
    ids: number[], 
    tx?: Knex.Transaction
  ): Promise<IAvailabilitySlot.Self[]> {
    if (isEmpty(ids)) throw new Error("At least one id must be passed.");

    const rows = await this.builder(tx)
      .whereIn(this.column("id"), ids)
      .delete()
      .returning("*");

    return rows.map(row => this.from(row));
  }

  async update(
    id: number,
    payload: IAvailabilitySlot.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<IAvailabilitySlot.Self> {
    const rows = await this.builder(tx)
      .update({
        start: payload.start ? dayjs.utc(payload.start).toDate() : undefined,
        end: payload.end ? dayjs.utc(payload.end).toDate() : undefined,
        updated_at: dayjs.utc().toDate(),
      })
      .where("id", id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Slot not found; should never happen.");
    return this.from(row);
  }

  async find({
    tx,
    users,
    after,
    before,
  }: WithOptionalTx<SearchFilter>
  ): Promise<IAvailabilitySlot.Self[]> {
    const baseBuilder = this.applySearchFilter(this.builder(tx), {
      users,
      after,
      before,
    });
    const rows = await baseBuilder.clone().select();
    return rows.map(row => this.from(row));
  }

  applySearchFilter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    {
      users,
      after,
      before,
    }: SearchFilter
  ): Knex.QueryBuilder<R, T> {
    if (users && !isEmpty(users))
      builder.whereIn(this.column("user_id"), users);

    if (after)
      builder.where(this.column("start"), ">=", dayjs.utc(after).toDate());
    if (before)
      builder.where(this.column("end"), "<=", dayjs.utc(before).toDate());

    return builder;
  }

  from(row: IAvailabilitySlot.Row): IAvailabilitySlot.Self {
    return {
      id: row.id,
      userId: row.user_id,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      createAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IAvailabilitySlot.Row>(this.table) : knex<IAvailabilitySlot.Row>(this.table);
  }

  column(value: keyof IAvailabilitySlot.Row) {
    return column(value, this.table);
  }
}

export const availabilitySlots = new AvailabilitySlots();
