import { Knex } from "knex";
import { column, knex, WithOptionalTx } from "@/query";
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
        activated: payload.activated,
        deleted: payload.deleted,
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
    const rows = await this.builder()
      .select("*")
      .where(key, value)
      .orderBy("created_at", "desc");
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

  async findActivatedRules(
    userIds: number[],
    start: string,
    tx?: Knex.Transaction
  ): Promise<IRule.Self[]> {
    const rows = await this.builder(tx)
      .select("*")
      .whereIn("user_id", userIds)
      .andWhere("activated", true)
      .andWhere("end", ">=", start); // select rules that didn't end yet.
    return rows.map((row) => this.from(row));
  }

  /**
   * retrieves activated rules that fully or partially lay between two dates
   * @param userId {number} - the user whose rules are in query
   * @param after {string} - the data (iso datetime) after which rules shall lay/intersect
   * @param before {string} - the data (iso datetime) before which rules shall lay/intersect
   *
   * @todo impl. generic finding function and call it `rules.find` @mmoehabb
   * @todo write tests @mmoehabb
   */
  async findActivatedRulesBetween({
    userId,
    after,
    before,
    tx,
  }: WithOptionalTx<{
    userId: number;
    after: string;
    before: string;
  }>): Promise<IRule.Self[]> {
    const rows = await this.builder(tx)
      .select("*")
      .where(this.column("user_id"), userId)
      .andWhere(this.column("activated"), true)
      .andWhere(this.column("deleted"), false)
      .andWhere((builder) =>
        builder
          .whereBetween(this.column("start"), [after, before])
          .orWhereBetween(this.column("end"), [after, before])
          .orWhere((builder) =>
            builder
              // rule started but not ended yet
              .where(this.column("start"), "<", after)
              .andWhere(this.column("end"), ">", before)
          )
      );
    return rows.map((row) => this.from(row));
  }

  async findByUserId({
    user,
    deleted = true,
    tx,
  }: {
    user: number;
    deleted?: boolean;
    tx?: Knex.Transaction;
  }): Promise<IRule.Self[]> {
    const rows = await this.builder(tx)
      .select("*")
      .where(this.column("user_id"), user)
      .andWhere(this.column("deleted"), deleted);
    return rows.map((row) => this.from(row));
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
