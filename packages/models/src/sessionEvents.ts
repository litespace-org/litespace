import { column, knex, WithOptionalTx } from "@/query";
import { first, isEmpty } from "lodash";
import { ISessionEvent } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";

export class SessionEvents {
  table = "events";

  async create(
    event: ISessionEvent.CreatePayload,
    tx: Knex.Transaction
  ): Promise<ISessionEvent.Self> {
    const now = dayjs.utc().toDate();
    const rows = await knex<ISessionEvent.Row>(this.table)
      .transacting(tx)
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

  from(row: ISessionEvent.Row): ISessionEvent.Self {
    return {
      id: row.id,
      type: row.type,
      userId: row.user_id,
      sessionId: row.session_id,
      createdAt: row.created_at.toISOString(),
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
