import { IAvailabilitySlot } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { first, isEmpty } from "lodash";
<<<<<<< HEAD:packages/models/src/availabilitySlot.ts
import { knex, column, WithOptionalTx } from "@/query";

type SearchFilter = {
  /**
=======
import {
  knex,
  column,
  countRows,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";

type SearchFilter = {
  /**
   * Slot ids to be included in the search query.
   */
  slots?: number[];
  /**
>>>>>>> 1861159d (add: find and set handlers for availability slots with unit tests.):packages/models/src/availabilitySlots.ts
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
<<<<<<< HEAD:packages/models/src/availabilitySlot.ts
=======
  deleted?: boolean;
  pagination?: IFilter.SkippablePagination;
>>>>>>> 1861159d (add: find and set handlers for availability slots with unit tests.):packages/models/src/availabilitySlots.ts
};

export class AvailabilitySlots {
  table = "availability_slots" as const;

  async create(
    payloads: IAvailabilitySlot.CreatePayload[],
    tx?: Knex.Transaction
  ): Promise<IAvailabilitySlot.Self[]> {
    if (isEmpty(payloads))
      throw new Error("At least one payload must be passed.");

    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert(
        payloads.map((payload) => ({
          user_id: payload.userId,
          start: dayjs.utc(payload.start).toDate(),
          end: dayjs.utc(payload.end).toDate(),
          created_at: now,
          updated_at: now,
        }))
      )
      .returning("*");

    return rows.map((row) => this.from(row));
  }

  async delete(ids: number[], tx?: Knex.Transaction) {
    if (isEmpty(ids)) throw new Error("At least one id must be passed.");
    await this.builder(tx).whereIn(this.column("id"), ids).del();
  }

  async update(
    id: number,
    payload: IAvailabilitySlot.UpdatePayload,
    tx?: Knex.Transaction
  ) {
    await this.builder(tx)
      .update({
        start: payload.start ? dayjs.utc(payload.start).toDate() : undefined,
        end: payload.end ? dayjs.utc(payload.end).toDate() : undefined,
        updated_at: dayjs.utc().toDate(),
      })
      .where("id", id);
  }

  async markAsDeleted({
    ids,
    tx,
  }: WithOptionalTx<{
    ids: number[];
  }>): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .update({
        deleted: true,
        updated_at: now,
      })
      .whereIn(this.column("id"), ids);
  }

  async find({
    tx,
    users,
    after,
    before,
  }: WithOptionalTx<SearchFilter>): Promise<IAvailabilitySlot.Self[]> {
    const baseBuilder = this.applySearchFilter(this.builder(tx), {
      users,
      after,
      before,
    });
<<<<<<< HEAD:packages/models/src/availabilitySlot.ts
    const rows = await baseBuilder.clone().select();
    return rows.map((row) => this.from(row));
=======
    const total = await countRows(baseBuilder.clone());
    const rows = await withSkippablePagination(baseBuilder.clone(), pagination);
    return {
      list: rows.map((row) => this.from(row)),
      total,
    };
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IAvailabilitySlot.Self | null> {
    const { list } = await this.find({ slots: [id], tx });
    return first(list) || null;
>>>>>>> 1861159d (add: find and set handlers for availability slots with unit tests.):packages/models/src/availabilitySlots.ts
  }

  async isOwner({
    slots,
    owner,
    tx,
  }: WithOptionalTx<{
    slots: number[];
    owner: number;
  }>): Promise<boolean> {
    if (isEmpty(slots)) return true;
    const builder = this.builder(tx)
      .whereIn(this.column("id"), slots)
      .where(this.column("user_id"), owner);
    const count = await countRows(builder);
    return count === slots.length;
  }

  async allExist(slots: number[], tx?: Knex.Transaction): Promise<boolean> {
    if (isEmpty(slots)) return true;
    const builder = this.builder(tx).whereIn(this.column("id"), slots);
    const count = await countRows(builder.clone());
    return Number(count) === slots.length;
  }

  applySearchFilter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    { slots, users, after, before, deleted }: SearchFilter
  ): Knex.QueryBuilder<R, T> {
    if (slots && !isEmpty(slots)) builder.whereIn(this.column("id"), slots);

    if (users && !isEmpty(users))
      builder.whereIn(this.column("user_id"), users);

    if (after)
      builder.where(this.column("start"), ">=", dayjs.utc(after).toDate());
    if (before)
      builder.where(this.column("end"), "<=", dayjs.utc(before).toDate());

    if (deleted) builder.where(this.column("deleted"), deleted);

    return builder;
  }

  from(row: IAvailabilitySlot.Row): IAvailabilitySlot.Self {
    return {
      id: row.id,
      userId: row.user_id,
      deleted: row.deleted,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      createAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IAvailabilitySlot.Row>(this.table)
      : knex<IAvailabilitySlot.Row>(this.table);
  }

  column(value: keyof IAvailabilitySlot.Row) {
    return column(value, this.table);
  }
}

export const availabilitySlots = new AvailabilitySlots();
