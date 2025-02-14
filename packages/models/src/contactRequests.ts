import { Knex } from "knex";
import { knex, column } from "@/query";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { IContactRequest } from "@litespace/types";

export class ContactRequests {
  table = "contact_requests" as const;

  async create(
    payloads: IContactRequest.CreatePayload[],
    tx?: Knex.Transaction
  ) {
    if (isEmpty(payloads))
      throw new Error("At least one payload must be passed.");

    const now = dayjs.utc().toDate();
    await this.builder(tx).insert(
      payloads.map((payload) => ({
        name: payload.name,
        email: payload.email,
        title: payload.title,
        message: payload.message,
        created_at: now,
      }))
    );
  }

  from(row: IContactRequest.Row): IContactRequest.Self {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      title: row.title,
      message: row.message,
      createdAt: row.created_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IContactRequest.Row>(this.table)
      : knex<IContactRequest.Row>(this.table);
  }

  column(value: keyof IContactRequest.Row) {
    return column(value, this.table);
  }
}

export const contactRequests = new ContactRequests();
