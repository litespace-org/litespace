import { IPlan, Paginated } from "@litespace/types";
import {
  countRows,
  knex,
  WithOptionalTx,
  withBooleanFilter,
  withDateFilter,
  withNumericFilter,
  withListFilter,
  withSkippablePagination,
} from "@/query";
import { first } from "lodash";
import { Knex } from "knex";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  active: "active",
  yearDiscount: "year_discount",
  weeklyMinutes: "weekly_minutes",
  monthDiscount: "month_discount",
  forInvitesOnly: "for_invites_only",
  quarterDiscount: "quarter_discount",
  baseMonthlyPrice: "base_monthly_price",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IPlan.Field, IPlan.Column>;

export class Plans extends Model<
  IPlan.Row,
  IPlan.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "plans",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create(payload: IPlan.CreatePayload): Promise<IPlan.Self> {
    const now = new Date();
    const rows = await knex<IPlan.Row>(this.table).insert(
      {
        weekly_minutes: payload.weeklyMinutes,
        base_monthly_price: payload.baseMonthlyPrice,
        month_discount: payload.monthDiscount,
        quarter_discount: payload.quarterDiscount,
        year_discount: payload.yearDiscount,
        for_invites_only: payload.forInvitesOnly,
        active: payload.active,
        created_at: now,
        updated_at: now,
      },
      "*"
    );
    const row = first(rows);
    if (!row) throw new Error("Plan not found; should never happen");
    return this.from(row);
  }

  async update(id: number, payload: IPlan.UpdatePayload): Promise<IPlan.Self> {
    const now = new Date();
    const rows = await knex<IPlan.Row>(this.table)
      .update(
        {
          weekly_minutes: payload.weeklyMinutes,
          base_monthly_price: payload.baseMonthlyPrice,
          month_discount: payload.monthDiscount,
          quarter_discount: payload.quarterDiscount,
          year_discount: payload.yearDiscount,
          for_invites_only: payload.forInvitesOnly,
          active: payload.active,
          updated_at: now,
        },
        "*"
      )
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Plan not found; should never happen");

    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IPlan.Row>(this.table).delete().where("id", id);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IPlan.Self | null> {
    const rows = await this.builder(tx)
      .where(this.column("id"), id)
      .select("*");
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async find({
    tx,
    ids,
    weeklyMinutes,
    baseMonthlyPrice,
    monthDiscount,
    quarterDiscount,
    yearDiscount,
    forInvitesOnly,
    active,
    createdAt,
    updatedAt,
    ...pagination
  }: WithOptionalTx<IPlan.FindQueryModel>): Promise<Paginated<IPlan.Self>> {
    const builder = this.builder(tx);

    // ============== boolean fields ========
    withBooleanFilter(builder, this.column("for_invites_only"), forInvitesOnly);
    withBooleanFilter(builder, this.column("active"), active);

    // ============== numerical fileds ========
    withNumericFilter(builder, this.column("weekly_minutes"), weeklyMinutes);
    withNumericFilter(
      builder,
      this.column("base_monthly_price"),
      baseMonthlyPrice
    );
    withNumericFilter(builder, this.column("month_discount"), monthDiscount);
    withNumericFilter(
      builder,
      this.column("quarter_discount"),
      quarterDiscount
    );
    withNumericFilter(builder, this.column("year_discount"), yearDiscount);

    // ============== date fields ========
    withDateFilter(builder, this.column("created_at"), createdAt);
    withDateFilter(builder, this.column("updated_at"), updatedAt);

    // ==============  list-based fileds ========
    withListFilter(builder, this.column("id"), ids);

    const total = await countRows(builder.clone(), { distinct: true });
    // const query = builder.select().orderBy(this.column("created_at"), "desc");
    const query = builder.select().orderBy([
      {
        column: this.column("created_at"),
        order: "desc",
      },
      {
        column: this.column("id"),
        order: "desc",
      },
    ]);

    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.from(row));

    return { list, total };
  }
}

export const plans = new Plans();
