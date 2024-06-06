import { IZoomAccount } from "@litespace/types";
import { query } from "./query";
import { first, fromPairs } from "lodash";
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
                "client_secret"
            )
        VALUES ($1, $2, $3, $4)
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

  update() {}

  findById() {}

  delete() {}

  findAll() {}

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
