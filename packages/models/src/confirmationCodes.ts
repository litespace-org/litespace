import { IConfirmationCode } from "@litespace/types";
import { column, knex, WithOptionalTx } from "@/query";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { first } from "lodash";

export class ConfirmationCodes {
  readonly table = "confirmation_codes" as const;

  readonly columns: Record<keyof IConfirmationCode.Row, string> = {
    id: this.column("id"),
    code: this.column("code"),
    user_id: this.column("user_id"),
    purpose: this.column("purpose"),
    created_at: this.column("created_at"),
    expires_at: this.column("expires_at"),
  };

  async create({
    tx,
    ...payload
  }: WithOptionalTx<IConfirmationCode.CreatePayload>): Promise<IConfirmationCode.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        code: payload.code,
        user_id: payload.userId,
        purpose: payload.purpose,
        created_at: now,
        expires_at: dayjs.utc(payload.expiresAt).toDate(),
      })
      .returning("*");

    const row = first(rows);

    if (!row) throw new Error("Code not found, should never happen");

    return this.from(row);
  }

  async findOneBy<T extends keyof IConfirmationCode.Row>(
    key: T,
    value: IConfirmationCode.Row[T]
  ): Promise<IConfirmationCode.Self | null> {
    const row = await knex<IConfirmationCode.Row>(this.table)
      .select(this.columns)
      .where(this.column(key), value)
      .first();

    if (!row) return null;
    return this.from(row);
  }

  async findById(id: number): Promise<IConfirmationCode.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findByCodeAndPurpose({
    tx,
    ...payload
  }: WithOptionalTx<IConfirmationCode.FindPayload>): Promise<
    IConfirmationCode.Self[]
  > {
    const rows = await this.builder(tx)
      .select(this.columns)
      .where({ ...payload });

    return rows.map((row) => this.from(row));
  }

  async deleteById({ tx, id }: WithOptionalTx<{ id: number }>): Promise<void> {
    await this.builder(tx).delete().where(this.column("id"), id);
  }

  async deleteByCodeAndPurpose({
    tx,
    ...payload
  }: WithOptionalTx<IConfirmationCode.DeleteByCodeAndPurpose>): Promise<void> {
    await this.builder(tx)
      .delete()
      .where({ ...payload });
  }

  builder(tx?: Knex.Transaction) {
    const builder = tx || knex;
    return builder<IConfirmationCode.Row>(this.table);
  }

  column(value: keyof IConfirmationCode.Row): string {
    return column<IConfirmationCode.Row>(value, this.table);
  }

  from(row: IConfirmationCode.Row): IConfirmationCode.Self {
    return {
      id: row.id,
      code: row.code,
      userId: row.user_id,
      purpose: row.purpose,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
    };
  }
}

export const confirmationCodes = new ConfirmationCodes();
