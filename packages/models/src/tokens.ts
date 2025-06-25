import { IToken } from "@litespace/types";
import { knex } from "@/query";
import { first } from "lodash";
import { Knex } from "knex";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  type: "type",
  used: "used",
  userId: "user_id",
  hash: "token_hash",
  expiresAt: "expires_at",
  updatedAt: "updated_at",
  createdAt: "created_at",
} satisfies Record<IToken.Field, IToken.Column>;

export class Tokens extends Model<
  IToken.Row,
  IToken.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "tokens",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create(payload: IToken.CreatePayload): Promise<IToken.Self> {
    const now = new Date();
    const rows = await knex<IToken.Row>("tokens").insert(
      {
        user_id: payload.userId,
        token_hash: payload.hash,
        type: payload.type,
        expires_at: payload.expiresAt,
        created_at: now,
        updated_at: now,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Token not found; should never happen");
    return this.from(row);
  }

  async makeAsUsed(id: number, tx?: Knex.Transaction): Promise<IToken.Self> {
    const rows = await this.builder(tx)
      .update({ used: true }, "*")
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Token not found; should never happen");
    return this.from(row);
  }

  async delete(id: number) {
    await knex<IToken.Row>("tokens").where("id", id).del();
  }

  async findOneBy<T extends keyof IToken.Row>(
    key: T,
    value: IToken.Row[T]
  ): Promise<IToken.Self | null> {
    const rows = await knex<IToken.Row>("tokens").select("*").where(key, value);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByHash(hash: string): Promise<IToken.Self | null> {
    return await this.findOneBy("token_hash", hash);
  }
}

export const tokens = new Tokens();
