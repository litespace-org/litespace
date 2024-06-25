import { IToken } from "@litespace/types";
import { knex } from "./query";
import { first } from "lodash";

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

  async delete() {}

  async findByHash() {}

  async findById() {}

  async findByUserId() {}

  from(row: IToken.Row): IToken.Self {
    return {
      id: row.id,
      userId: row.user_id,
      hash: row.token_hash,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
