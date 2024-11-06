import { column, countRows, knex, withPagination } from "@/query";
import { first } from "lodash";
import { IFilter, IMessage, Paginated } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";

export class Messages {
  table = "messages" as const;

  async create(payload: IMessage.CreatePayload): Promise<IMessage.Self> {
    const now = dayjs.utc().toDate();
    const rows: IMessage.Row[] = await knex<IMessage.Row>(this.table)
      .insert({
        user_id: payload.userId,
        room_id: payload.roomId,
        text: payload.text,
        created_at: now,
        updated_at: now,
      })
      .returning("*");
    const row = first(rows);
    if (!row) throw new Error("Message not found; should never happen");
    return this.from(row);
  }

  async updateBy<T extends keyof IMessage.Row>(
    id: number,
    key: T,
    value: IMessage.Row[T]
  ): Promise<void> {
    await knex<IMessage.Row>(this.table)
      .update({ [key]: value, updated_at: dayjs().utc().toDate() })
      .where("id", id);
  }

  async update(
    id: number,
    payload: IMessage.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<IMessage.Self | null> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .update({ text: payload.text, updated_at: now })
      .where(this.column("id"), id)
      .returning("*");

    const row = first(rows);
    return row ? this.from(row) : null;
  }

  async markAsRead(id: number): Promise<void> {
    return this.updateBy(id, "read", true);
  }

  async markAsDeleted(id: number): Promise<void> {
    return this.updateBy(id, "deleted", true);
  }

  async findById(id: number): Promise<IMessage.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findOneBy<T extends keyof IMessage.Row>(
    key: T,
    value: IMessage.Row[T]
  ): Promise<IMessage.Self | null> {
    const messages = await this.findManyBy(key, value);
    return first(messages) || null;
  }

  async findManyBy<T extends keyof IMessage.Row>(
    key: T,
    value: IMessage.Row[T],
    tx?: Knex.Transaction
  ): Promise<IMessage.Self[]> {
    const rows = await this.builder(tx).select("*").where(key, value);
    return rows.map((row) => this.from(row));
  }

  /**
   *  @param deleted {boolean} a flag to include or exclude deleted messages.
   *  Default is `false` (deleted messages are not included by default)
   */
  async findRoomMessages({
    room,
    deleted = false,
    tx,
    page,
    size,
  }: {
    room: number;
    deleted?: boolean;
    tx?: Knex.Transaction;
  } & IFilter.Pagination): Promise<Paginated<IMessage.Self>> {
    const builder = this.builder(tx).where(this.column("room_id"), room);
    if (!deleted) builder.andWhere(this.column("deleted"), false);

    const total = await countRows(builder.clone());
    const query = builder
      .clone()
      .select()
      .orderBy([
        { column: this.column("created_at"), order: "asc" },
        { column: this.column("id"), order: "asc" },
      ]);

    const rows = await withPagination(query, { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  async countUserMessages({
    user,
    tx,
  }: {
    user: number;
    tx?: Knex.Transaction;
  }): Promise<number> {
    const builder = this.builder(tx).where(this.column("user_id"), user);
    return await countRows(builder, { column: this.column("id") });
  }

  builder(tx?: Knex.Transaction) {
    const fn = tx || knex;
    return fn<IMessage.Row>(this.table);
  }

  column(value: keyof IMessage.Row): string {
    return column(value, this.table);
  }

  from(row: IMessage.Row): IMessage.Self {
    return {
      id: row.id,
      userId: row.user_id,
      roomId: row.room_id,
      text: row.text,
      read: row.read,
      deleted: row.deleted,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const messages = new Messages();
