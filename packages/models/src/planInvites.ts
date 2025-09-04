import {
  countRows,
  withDateFilter,
  withListFilter,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { IPlanInvites, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { Model } from "@/lib/model";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

const FIELD_TO_COLUMN = {
  id: "id",
  userId: "user_id",
  planId: "plan_id",
  createdBy: "created_by",
  createdAt: "created_at",
  expiresAt: "expires_at",
} satisfies Record<IPlanInvites.Field, IPlanInvites.Column>;

export class PlanInvites extends Model<
  IPlanInvites.Row,
  IPlanInvites.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "plan_invites",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create(
    payload: WithOptionalTx<IPlanInvites.CreateModelPayload>
  ): Promise<IPlanInvites.Self> {
    const now = dayjs.utc().toDate();
    const expiresAt = payload.expiresAt
      ? dayjs.utc(payload.expiresAt).toDate()
      : undefined;

    const rows = await this.builder(payload.tx)
      .insert(
        payload.userIds.map((userId) => ({
          user_id: userId,
          plan_id: payload.planId,
          created_by: payload.createdBy,
          created_at: now,
          expires_at: expiresAt,
        }))
      )
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("plan-invite not found; should never happen");
    return this.from(row);
  }

  async update(
    payload: WithOptionalTx<IPlanInvites.UpdateModelPayload>
  ): Promise<void> {
    const expiresAt = payload.expiresAt
      ? dayjs.utc(payload.expiresAt).toDate()
      : undefined;
    await this.builder(payload.tx)
      .update({ expires_at: expiresAt })
      .whereIn(this.column("id"), payload.ids);
  }

  async deleteById(id: number, tx?: Knex.Transaction): Promise<void> {
    await this.builder(tx).del().where(this.column("id"), id);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IPlanInvites.Self | null> {
    const { list } = await this.find({ ids: [id], tx });
    return first(list) || null;
  }

  async find<T extends IPlanInvites.Field = IPlanInvites.Field>({
    ids,
    userIds,
    planIds,
    createdBy,
    expiresAt,
    select,
    tx,
    ...pagination
  }: WithOptionalTx<IPlanInvites.FindModelPayload<T>>): Promise<
    Paginated<Pick<IPlanInvites.Self, T>>
  > {
    const base = this.builder(tx);

    // ============== list fields ========
    withListFilter(base, this.column("id"), ids);
    withListFilter(base, this.column("user_id"), userIds);
    withListFilter(base, this.column("plan_id"), planIds);
    withListFilter(base, this.column("created_by"), createdBy);

    // ============== date fields ========
    withDateFilter(base, this.column("expires_at"), expiresAt);

    const total = await countRows(base.clone(), {
      column: this.column("id"),
      distinct: true,
    });

    const queryBuilder = base
      .clone()
      .select(this.select(select))
      .orderBy([
        {
          column: this.column("created_at"),
          order: "desc",
        },
        {
          column: this.column("id"),
          order: "desc",
        },
      ]);

    const rows = await withSkippablePagination(queryBuilder, pagination);
    const planInvites = rows.map((row) => this.from(row));
    return { list: planInvites, total };
  }
}

export const planInvites = new PlanInvites();
