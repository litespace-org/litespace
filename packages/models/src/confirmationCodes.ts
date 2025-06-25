import { IConfirmationCode } from "@litespace/types";
import { knex, WithOptionalTx } from "@/query";
import dayjs from "@/lib/dayjs";
import { first, isEmpty } from "lodash";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  code: "code",
  userId: "user_id",
  purpose: "purpose",
  createdAt: "created_at",
  expiresAt: "expires_at",
} satisfies Record<IConfirmationCode.Field, IConfirmationCode.Column>;

export class ConfirmationCodes extends Model<
  IConfirmationCode.Row,
  IConfirmationCode.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "confirmation_codes",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

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
    value: IConfirmationCode.Row[T],
    select?: (keyof IConfirmationCode.Self)[]
  ): Promise<IConfirmationCode.Self | null> {
    const row = await knex<IConfirmationCode.Row>(this.table)
      .select(this.select(select))
      .where(this.column(key), value)
      .first();

    if (!row) return null;
    return this.from(row);
  }

  async findById(id: number): Promise<IConfirmationCode.Self | null> {
    return await this.findOneBy("id", id);
  }

  async find({
    tx,
    code,
    purpose,
    userId,
    select,
  }: WithOptionalTx<IConfirmationCode.FindModelPayload>): Promise<
    IConfirmationCode.Self[]
  > {
    const baseBuilder = this.builder(tx);

    if (code) baseBuilder.where(this.column("code"), code);
    if (purpose) baseBuilder.where(this.column("purpose"), purpose);
    if (userId) baseBuilder.where(this.column("user_id"), userId);

    const rows = await baseBuilder.select(this.select(select));
    return rows.map((row) => this.from(row));
  }

  async deleteById({ tx, id }: WithOptionalTx<{ id: number }>): Promise<void> {
    await this.builder(tx).delete().where(this.column("id"), id);
  }

  async delete({
    ids = [],
    users = [],
    purposes = [],
    codes = [],
    tx,
  }: WithOptionalTx<{
    ids?: number[];
    users?: Array<number | null>;
    purposes?: IConfirmationCode.Purpose[];
    codes?: number[];
  }>) {
    const builder = this.builder(tx);

    if (!isEmpty(ids)) builder.whereIn(this.column("id"), ids);
    if (!isEmpty(users)) {
      const userIds = users.filter((id) => id !== null);
      const includeNull = users.includes(null);

      builder.where((builder) => {
        builder.whereIn(this.column("user_id"), userIds);
        if (includeNull) builder.orWhere(this.column("user_id"), "IS", null);
      });
    }

    if (!isEmpty(purposes)) builder.whereIn(this.column("purpose"), purposes);
    if (!isEmpty(codes)) builder.whereIn(this.column("code"), codes);

    await builder.delete();
  }
}

export const confirmationCodes = new ConfirmationCodes();
