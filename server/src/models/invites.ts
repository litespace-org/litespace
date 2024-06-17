import { IInvite } from "@litespace/types";
import { knex } from "./query";
import { first, omit } from "lodash";

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
    const plans = this.mapSelectQuery(
      await this.getSelectQuery().where("invites.id", id)
    );
    return first(plans) || null;
  }

  async findAll(): Promise<IInvite.MappedAttributes[]> {
    return this.mapSelectQuery(await this.getSelectQuery());
  }

  getSelectQuery() {
    return knex<IInvite.Row>("invites")
      .select<IInvite.Attributed[]>({
        id: "invites.id",
        email: "invites.email",
        planId: "invites.plan_id",
        acceptedAt: "invites.accepted_at",
        expiresAt: "invites.expires_at",
        createdAt: "invites.created_at",
        createdById: "invites.created_by",
        createdByEmail: "creator.email",
        createdByName: "creator.name",
        updatedAt: "invites.updated_at",
        updatedById: "invites.updated_by",
        updatedByEmail: "updator.email",
        updatedByName: "updator.name",
      })
      .innerJoin("users AS creator", "creator.id", "invites.created_by")
      .innerJoin("users AS updator", "updator.id", "invites.updated_by")
      .clone();
  }

  // todo: impl. mapping util
  mapSelectQuery(list: IInvite.Attributed[]): IInvite.MappedAttributes[] {
    return list.map((invite) =>
      omit(
        {
          ...invite,
          createdBy: {
            id: invite.createdById,
            email: invite.createdByEmail,
            name: invite.createdByName,
          },
          updatedBy: {
            id: invite.updatedById,
            email: invite.updatedByEmail,
            name: invite.updatedByName,
          },
          createdAt: invite.createdAt.toISOString(),
          updatedAt: invite.updatedAt.toISOString(),
          expiresAt: invite.expiresAt.toISOString(),
          acceptedAt: invite.acceptedAt
            ? invite.acceptedAt.toISOString()
            : null,
        },
        "createdById",
        "createdByEmail",
        "createdByName",
        "updatedById",
        "udpatedByEmail",
        "updatedByName"
      )
    );
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
