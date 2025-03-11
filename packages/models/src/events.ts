import { column, knex } from "@/query";
import { first } from "lodash";
import { IEvent } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";

export class Events {
  table = "events";

  column = (value: keyof IEvent.Row) => column(value, this.table);

  async create(
    events: IEvent.CreatePayload[],
    tx: Knex.Transaction
  ): Promise<IEvent.Self[]> {
    const now = dayjs.utc().toDate();
    const rows = await knex<IEvent.Row>(this.table)
      .transacting(tx)
      .insert(
        events.map((event) => ({
          type: event.type,
          user_id: event.userId,
          created_at: now,
        }))
      )
      .returning("*");
    return rows.map((row) => this.from(row));
  }

  async findById(id: number): Promise<IEvent.Self | null> {
    const rows: IEvent.Row[] = await knex<IEvent.Row>(this.table)
      .select("*")
      .where("id", id);

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByUserId(id: number): Promise<IEvent.Self[]> {
    const rows: IEvent.Row[] = await knex<IEvent.Row>(this.table)
      .select("*")
      .where("user_id", id);

    return rows.map((row) => this.from(row));
  }

  from(row: IEvent.Row): IEvent.Self {
    return {
      id: row.id,
      type: row.type,
      userId: row.user_id,
      createdAt: row.created_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    const builder = tx || knex;
    return builder<IEvent.Row>(this.table);
  }
}

export const events = new Events();
