import { IAvailabilitySlot, Paginated } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { first, isEmpty } from "lodash";
import {
  knex,
  column,
  countRows,
  WithOptionalTx,
  withSkippablePagination,
  withListFilter,
  withDateFilter,
  withBooleanFilter,
} from "@/query";
import { users } from "@/users";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  userId: "user_id",
  purpose: "purpose",
  start: "start",
  end: "end",
  deleted: "deleted",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IAvailabilitySlot.Field, IAvailabilitySlot.Column>;

export class AvailabilitySlots extends Model<
  IAvailabilitySlot.Row,
  IAvailabilitySlot.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "availability_slots",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

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
          // TODO: make purpose unoptional and remove the || expression
          purpose: payload.purpose || IAvailabilitySlot.Purpose.Lesson,
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
        purpose: payload.purpose,
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
    ids,
    userIds,
    roles,
    start,
    end,
    createdAt,
    deleted,
    purposes,
    execludeSlots,
    select,
    ...pagination
  }: WithOptionalTx<IAvailabilitySlot.FindModelQuery>): Promise<
    Paginated<IAvailabilitySlot.Self>
  > {
    const base = this.builder(tx);

    // ============== list fields ========
    withListFilter(base, this.column("id"), ids);
    withListFilter(base, this.column("user_id"), userIds);
    withListFilter(base, this.column("purpose"), purposes);

    if (execludeSlots && !isEmpty(execludeSlots))
      base.whereNotIn(this.column("id"), execludeSlots);

    // ============== date fields ========
    withDateFilter(base, this.column("created_at"), createdAt);
    // @moehab TODO: refactor this; make an or utility filter function
    base
      .where((builder) => withDateFilter(builder, this.column("start"), start))
      .orWhere((builder) => withDateFilter(builder, this.column("end"), end));

    // ============== boolean fields ========
    withBooleanFilter(base, this.column("deleted"), deleted);

    //======= filters after joins ====== =
    if (roles && !isEmpty(roles)) {
      base.innerJoin(users.table, (builder) =>
        builder
          .on(users.column("id"), this.column("user_id"))
          .andOnIn(users.column("role"), roles)
      );
    }

    const total = await countRows(base.clone(), {
      column: this.column("id"),
      distinct: true,
    });

    const queryBuilder = base
      .clone()
      .select(this.select(select))
      .orderBy([
        {
          column: this.column("created_at"),
          order: "desc",
        },
        {
          column: this.column("id"),
          order: "desc",
        },
      ]);

    const rows = await withSkippablePagination(queryBuilder, pagination);
    const demoSessions = rows.map((row) => this.from(row));
    return { list: demoSessions, total };
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IAvailabilitySlot.Self | null> {
    const { list } = await this.find({ ids: [id], tx });
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

  from(row: IAvailabilitySlot.Row): IAvailabilitySlot.Self {
    return {
      id: row.id,
      userId: row.user_id,
      purpose: row.purpose,
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
