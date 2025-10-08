import {
  column,
  countRows,
  knex,
  WithOptionalTx,
  withPagination,
} from "@/query";
import { first, isEmpty } from "lodash";
import { ISessionEvent, Paginated } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { users } from "@/users";
import { lessons } from "@/lessons";

export class SessionEvents {
  table = "session_events";

  async create(
    event: ISessionEvent.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<ISessionEvent.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        type: event.type,
        user_id: event.userId,
        session_id: event.sessionId,
        created_at: now,
      })
      .returning("*");
    const row = first(rows);
    if (!row) throw new Error("Session event not found; should never happen");
    return this.from(row);
  }

  async createMany(
    events: ISessionEvent.CreatePayload[],
    tx: Knex.Transaction
  ): Promise<ISessionEvent.Self[]> {
    const now = dayjs.utc().toDate();
    const rows = await knex<ISessionEvent.Row>(this.table)
      .transacting(tx)
      .insert(
        events.map((event) => ({
          type: event.type,
          user_id: event.userId,
          session_id: event.sessionId,
          created_at: now,
        }))
      )
      .returning("*");
    return rows.map((row) => this.from(row));
  }
  async findOneBy<T extends keyof ISessionEvent.Row>(
    key: T,
    value: ISessionEvent.Row[T],
    tx?: Knex.Transaction
  ): Promise<ISessionEvent.Self | null> {
    const row = await this.builder(tx)
      .select("*")
      .where(this.column(key), value)
      .first();
    if (!row) return null;
    return this.from(row);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ISessionEvent.Self | null> {
    return this.findOneBy("id", id, tx);
  }

  async find({
    users,
    sessionIds,
    tx,
  }: WithOptionalTx<{
    users?: number[];
    sessionIds?: number[];
  }>): Promise<ISessionEvent.Self[]> {
    const builder = this.builder(tx).select("*");

    if (users && !isEmpty(users))
      builder.whereIn(this.column("user_id"), users);

    if (sessionIds && !isEmpty(sessionIds))
      builder.whereIn(this.column("session_id"), sessionIds);

    const rows = await builder.then();
    return rows.map((row) => this.from(row));
  }

  async findMeta({
    userIds,
    sessionIds,
    page,
    size,
    tx,
  }: WithOptionalTx<ISessionEvent.FindModelQuery>): Promise<
    Paginated<ISessionEvent.MetaSelf>
  > {
    const builder = this.builder(tx);

    if (userIds && !isEmpty(userIds))
      builder.whereIn(this.column("user_id"), userIds);

    if (sessionIds && !isEmpty(sessionIds))
      builder.whereIn(this.column("session_id"), sessionIds);

    const total = await countRows(builder.clone(), {
      column: this.column("id"),
      distinct: true,
    });

    builder
      .join(users.table, this.column("user_id"), users.column("id"))
      .join(
        lessons.table.lessons,
        this.column("session_id"),
        lessons.columns.lessons("session_id")
      );

    const rows = await withPagination(builder, { page, size }).select(
      this.column("id"),
      this.column("type"),
      this.column("user_id"),
      this.column("session_id"),
      this.column("created_at"),
      "users.name as user_name",
      "lessons.start as session_start"
    );

    return {
      list: rows.map((row) => this.fromMeta(row as ISessionEvent.MetaRow)),
      total,
    };
  }

  from(row: ISessionEvent.Row): ISessionEvent.Self {
    return {
      id: row.id,
      type: row.type,
      userId: row.user_id,
      sessionId: row.session_id,
      createdAt: row.created_at.toISOString(),
    };
  }

  fromMeta(row: ISessionEvent.MetaRow): ISessionEvent.MetaSelf {
    return {
      id: row.id,
      type: row.type,
      userId: row.user_id,
      userName: row.user_name,
      sessionId: row.session_id,
      createdAt: row.created_at.toISOString(),
      sessionStart: row.session_start.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    const builder = tx || knex;
    return builder<ISessionEvent.Row>(this.table);
  }

  column(value: keyof ISessionEvent.Row) {
    return column(value, this.table);
  }
}

export const sessionEvents = new SessionEvents();
