import { IInvite } from "@litespace/types";
import { knex } from "@/query";
import { first, omit } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";

export class Invites {
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

  async findAll(): Promise<IInvite.MappedAttributes[]> {
    return this.mapAttributesQuery(await this.getAttributesQuery());
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

  from(row: IInvite.Row): IInvite.Self {
    return {
      id: row.id,
      email: row.email,
      planId: row.plan_id,
      acceptedAt: row.accepted_at ? row.accepted_at.toISOString() : null,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      createdBy: row.created_by,
      updatedAt: row.updated_at.toISOString(),
      updatedBy: row.updated_by,
    };
  }
}

export const invites = new Invites();
