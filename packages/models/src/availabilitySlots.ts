import { IAvailabilitySlot, IFilter, Paginated } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { first, isEmpty } from "lodash";
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
   * Slot ids to be execluded from th search query.
   */
  execludeSlots?: number[];
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
  deleted?: boolean;
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
    slots,
    after,
    before,
    page,
    size,
    full,
    deleted,
    execludeSlots,
  }: WithOptionalTx<SearchFilter & IFilter.SkippablePagination>): Promise<
    Paginated<IAvailabilitySlot.Self>
  > {
    const baseBuilder = this.applySearchFilter(this.builder(tx), {
      users,
      slots,
      after,
      before,
      deleted,
      execludeSlots,
    });
    const total = await countRows(baseBuilder.clone());
    const rows = await withSkippablePagination(baseBuilder.clone(), {
      page,
      size,
      full,
    });
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

  /**
   * NOTE: this function filters out the marked-as-deleted rows
   */
  async allExist(slots: number[], tx?: Knex.Transaction): Promise<boolean> {
    if (isEmpty(slots)) return true;
    const builder = this.builder(tx)
      .where(this.column("deleted"), false)
      .whereIn(this.column("id"), slots);
    const count = await countRows(builder.clone());
    return Number(count) === slots.length;
  }

  applySearchFilter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    { slots, users, after, before, deleted, execludeSlots }: SearchFilter
  ): Knex.QueryBuilder<R, T> {
    if (slots && !isEmpty(slots)) builder.whereIn(this.column("id"), slots);

    if (execludeSlots && !isEmpty(execludeSlots))
      builder.whereNotIn(this.column("id"), execludeSlots);

    if (users && !isEmpty(users))
      builder.whereIn(this.column("user_id"), users);

    const start = this.column("start");
    const end = this.column("end");

    if (after)
      builder.where((builder) => {
        builder
          .where(start, ">=", dayjs.utc(after).toDate())
          .orWhere(end, ">", dayjs.utc(after).toDate());
      });
    if (before)
      builder.where((builder) => {
        builder
          .where(end, "<=", dayjs.utc(before).toDate())
          .orWhere(start, "<", dayjs.utc(before).toDate());
      });

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
      createdAt: row.created_at.toISOString(),
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
