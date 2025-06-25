import { IFilter, IInvite, Paginated } from "@litespace/types";
import { countRows, knex, withPagination } from "@/query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";
import { Knex } from "knex";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  email: "email",
  planId: "plan_id",
  acceptedAt: "accepted_at",
  expiresAt: "expires_at",
  createdAt: "created_at",
  createdBy: "created_by",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} satisfies Record<IInvite.Field, IInvite.Column>;

export class Invites extends Model<
  IInvite.Row,
  IInvite.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "invites",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create(payload: IInvite.CreatePayload): Promise<IInvite.Self> {
    const now = new Date();
    const rows = await knex<IInvite.Row>("invites").insert(
      {
        email: payload.email,
        plan_id: payload.planId,
        expires_at: new Date(payload.expiresAt),
        created_at: now,
        created_by: payload.createdBy,
        updated_at: now,
        updated_by: payload.createdBy,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Invite not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IInvite.UpdatePayload
  ): Promise<IInvite.Self> {
    const now = new Date();
    const rows = await knex<IInvite.Row>("invites")
      .update(
        {
          email: payload.email,
          plan_id: payload.planId,
          expires_at: payload.expiresAt
            ? new Date(payload.expiresAt)
            : undefined,
          updated_at: now,
          updated_by: payload.updatedBy,
        },
        "*"
      )
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Invite not found; should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IInvite.Row>("invites").delete().where("id", id);
  }

  async findById(id: number): Promise<IInvite.MappedAttributes | null> {
    const list = this.mapAttributesQuery(
      await this.getAttributesQuery().where("invites.id", id)
    );
    return first(list) || null;
  }

  async findByEmail(
    email: string,
    tx?: Knex.Transaction
  ): Promise<IInvite.Self | null> {
    const row = await this.builder(tx)
      .select()
      .where(this.column("email"), email)
      .first();
    return row ? this.from(row) : null;
  }

  async find({
    tx,
    page,
    size,
  }: { tx?: Knex.Transaction } & IFilter.Pagination): Promise<
    Paginated<IInvite.Self>
  > {
    const builder = this.builder(tx);
    const total = await countRows(builder.clone());
    const rows = await withPagination(builder.clone(), { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  getAttributesQuery() {
    return asAttributesQuery<IInvite.Row, IInvite.Attributed[]>("invites", {
      id: "invites.id",
      email: "invites.email",
      planId: "invites.plan_id",
      acceptedAt: "invites.accepted_at",
      expiresAt: "invites.expires_at",
    });
  }

  mapAttributesQuery(list: IInvite.Attributed[]): IInvite.MappedAttributes[] {
    return mapAttributesQuery(list, (item) => ({
      expiresAt: item.expiresAt.toISOString(),
      acceptedAt: item.acceptedAt ? item.acceptedAt.toISOString() : null,
    }));
  }
}

export const invites = new Invites();
