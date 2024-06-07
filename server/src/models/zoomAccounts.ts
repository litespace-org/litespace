import { IZoomAccount } from "@litespace/types";
import { query } from "@/models/query";
import { first } from "lodash";
export class ZoomAccounts {
  async create(
    account: IZoomAccount.CreatePayload
  ): Promise<IZoomAccount.Self> {
    const { rows } = await query<
      IZoomAccount.Row,
      [email: string, accountId: string, clientId: string, clientSecret: string]
    >(
      `
        INSERT INTO
            "zoom_accounts" (
                "email",
                "account_id",
                "client_id",
                "client_secret",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING
            "id",
            "email",
            "account_id",
            "client_id",
            "client_secret",
            "remaining_api_calls",
            "created_at",
            "updated_at";
      `,
      [account.email, account.accountId, account.clientId, account.clientSecret]
    );

    const row = first(rows);
    if (!row) throw new Error("Zoom account not found; should never happen");
    return this.from(row);
  }

  async update(id: number, account: IZoomAccount.UpdatePayload) {
    await query<
      IZoomAccount.Row,
      [
        accountId: string | undefined,
        clientId: string | undefined,
        clientSecret: string | undefined,
        id: number,
      ]
    >(
      `
        UPDATE "zoom_accounts"
        SET
            account_id = COALESCE($1, account_id),
            client_id = COALESCE($2, client_id),
            client_secret = COALESCE($3, client_secret)
        WHERE
            id = $4;
      `,
      [account.accountId, account.clientId, account.clientSecret, id]
    );
  }

  async findById(id: number): Promise<IZoomAccount.Self | null> {
    const { rows } = await query<IZoomAccount.Row, [id: number]>(
      `
        SELECT
            "id",
            "email",
            "account_id",
            "client_id",
            "client_secret",
            "remaining_api_calls",
            "created_at",
            "updated_at"
        FROM "zoom_accounts"
        WHERE
            zoom_accounts.id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM "zoom_accounts" WHERE id = $1`, [id]);
  }

  async findAll(): Promise<IZoomAccount.Self[]> {
    const { rows } = await query<IZoomAccount.Row, []>(
      `
        SELECT
            "id",
            "email",
            "account_id",
            "client_id",
            "client_secret",
            "remaining_api_calls",
            "created_at",
            "updated_at"
        FROM "zoom_accounts";
      `
    );

    return rows.map((row) => this.from(row));
  }

  async findAvailableAccount(): Promise<IZoomAccount.Self | null> {
    const { rows } = await query<IZoomAccount.Row, []>(
      `
      SELECT
          "id",
          "email",
          "account_id",
          "client_id",
          "client_secret",
          "created_at",
          "updated_at",
          MAX("remaining_api_calls") as "remaining_api_calls"
      FROM "zoom_accounts"
      GROUP BY
          "id"
      ORDER BY "remaining_api_calls" DESC
      LIMIT 1;
      `
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async decreaseRemainingApiCalls(id: number, by: number = 1) {
    await query<{}, [by: number, id: number]>(
      `
      UPDATE "zoom_accounts"
      SET
          remaining_api_calls = remaining_api_calls - $1 
      WHERE
          id = $2;
      `,
      [by, id]
    );
  }

  from(row: IZoomAccount.Row): IZoomAccount.Self {
    return {
      id: row.id,
      email: row.email,
      accountId: row.account_id,
      clientId: row.client_id,
      clientSecret: row.client_secret,
      remainingApiCalls: row.remaining_api_calls,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const zoomAccounts = new ZoomAccounts();
