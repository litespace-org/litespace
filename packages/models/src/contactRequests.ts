import { Knex } from "knex";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { IContactRequest } from "@litespace/types";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  message: "message",
  name: "name",
  phone: "phone",
  title: "title",
  createdAt: "created_at",
} satisfies Record<IContactRequest.Field, IContactRequest.Column>;

export class ContactRequests extends Model<
  IContactRequest.Row,
  IContactRequest.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "contact_requests",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

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
        phone: payload.phone,
        title: payload.title,
        message: payload.message,
        created_at: now,
      }))
    );
  }
}

export const contactRequests = new ContactRequests();
