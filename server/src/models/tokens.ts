import { IToken } from "@litespace/types";
import { knex } from "./query";
import { first, has } from "lodash";

export class Tokens {
  async create(payload: IToken.CreatePayload): Promise<IToken.Self> {
    const now = new Date();
    const rows = await knex<IToken.Row>("tokens").insert(
      {
        user_id: payload.userId,
        token_hash: payload.hash,
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

  async makeAsUsed(id: number): Promise<IToken.Self> {
    const rows = await knex<IToken.Row>("tokens")
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

  from(row: IToken.Row): IToken.Self {
    return {
      id: row.id,
      userId: row.user_id,
      hash: row.token_hash,
      used: row.used,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
