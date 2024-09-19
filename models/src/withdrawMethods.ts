import { Knex } from "knex";
import { column, knex } from "@/query";
import { IWithdrawMethod } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

export class WithdrawMethods {
  readonly table = "withdraw_methods" as const;

  readonly columns: Record<keyof IWithdrawMethod.Row, string> = {
    type: this.column("type"),
    min: this.column("min"),
    max: this.column("max"),
    enabled: this.column("enabled"),
    created_at: this.column("created_at"),
    updated_at: this.column("updated_at"),
  } as const;

  async create(
    payload: IWithdrawMethod.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<IWithdrawMethod.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        type: payload.type,
        min: payload.min,
        max: payload.max,
        enabled: payload.enabled,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Withdraw method not found; should never happen");
    return this.from(row);
  }

  async update(
    type: IWithdrawMethod.Type,
    payload: IWithdrawMethod.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<IWithdrawMethod.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .update({
        min: payload.min,
        max: payload.max,
        enabled: payload.enabled,
        updated_at: now,
      })
      .where(this.column("type"), type)
      .returning("*");
    const row = first(rows);
    if (!row) throw new Error("Withdraw method not found; should never happen");
    return this.from(row);
  }

  async find(tx?: Knex.Transaction): Promise<IWithdrawMethod.Self[]> {
    const rows = await this.builder(tx).select(this.columns);
    return rows.map((row) => this.from(row));
  }

  async findByType(
    type: IWithdrawMethod.Type,
    tx?: Knex.Transaction
  ): Promise<IWithdrawMethod.Self | null> {
    const row = await this.builder(tx)
      .select(this.columns)
      .where(this.column("type"), type)
      .first();
    if (!row) return null;
    return this.from(row);
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IWithdrawMethod.Row>(this.table)
      : knex<IWithdrawMethod.Row>(this.table);
  }

  column(value: keyof IWithdrawMethod.Row): string {
    return column(value, this.table);
  }

  from(row: IWithdrawMethod.Row): IWithdrawMethod.Self {
    return {
      type: row.type,
      min: row.min,
      max: row.max,
      enabled: row.enabled,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.created_at.toISOString(),
    };
  }
}

export const withdrawMethods = new WithdrawMethods();
