import { Knex } from "knex";
import { column, knex } from "@/models/query";
import { IRule } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

export class Rules {
  table = "rules" as const;

  async create(
    payload: IRule.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<IRule.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        user_id: payload.userId,
        title: payload.title,
        frequency: payload.frequency,
        start: dayjs.utc(payload.start).toDate(),
        end: dayjs.utc(payload.end).toDate(),
        time: payload.time,
        duration: payload.duration,
        weekdays: JSON.stringify(payload.weekdays || []),
        monthday: payload.monthday || null,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Rule not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IRule.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<IRule.Self> {
    const rows = await this.builder(tx)
      .update({
        title: payload.title,
        frequency: payload.frequency,
        start: payload.start ? dayjs.utc(payload.start).toDate() : undefined,
        end: payload.end ? dayjs.utc(payload.end).toDate() : undefined,
        time: payload.time,
        duration: payload.duration,
        weekdays: payload.weekdays
          ? JSON.stringify(payload.weekdays)
          : undefined,
        monthday: payload.monthday || null,
        updated_at: dayjs.utc().toDate(),
      })
      .where("id", id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Rule not found; should never happen.");
    return this.from(row);
  }

  async delete(id: number, tx?: Knex.Transaction): Promise<IRule.Self> {
    const rows = await this.builder(tx).where("id", id).delete().returning("*");
    const row = first(rows);
    if (!row) throw new Error("Rule not found; should never happen");
    return this.from(row);
  }

  async findManyBy<T extends keyof IRule.Row>(
    key: T,
    value: IRule.Row[T]
  ): Promise<IRule.Self[]> {
    const rows = await this.builder().select("*").where(key, value);
    return rows.map((row) => this.from(row));
  }

  async findOneBy<T extends keyof IRule.Row>(
    key: T,
    value: IRule.Row[T]
  ): Promise<IRule.Self | null> {
    const rules = await this.findManyBy(key, value);
    return first(rules) || null;
  }

  async findById(id: number): Promise<IRule.Self | null> {
    return this.findOneBy("id", id);
  }

  async findByUserId(id: number): Promise<IRule.Self[]> {
    return this.findManyBy("user_id", id);
  }

  from(row: IRule.Row): IRule.Self {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      frequency: row.frequency,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      time: row.time,
      duration: row.duration,
      weekdays:
        typeof row.weekdays === "string"
          ? JSON.parse(row.weekdays)
          : Array.isArray(row.weekdays)
            ? row.weekdays
            : [],
      monthday: row.monthday,
      activated: row.activated,
      deleted: row.deleted,
      createAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IRule.Row>(this.table) : knex<IRule.Row>(this.table);
  }

  column(value: keyof IRule.Row) {
    return column(value, this.table);
  }
}

export const rules = new Rules();
