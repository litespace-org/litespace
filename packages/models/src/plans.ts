import { IPlan, Paginated } from "@litespace/types";
import {
  column,
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

export class Plans {
  table = "plans" as const;

  async create(payload: IPlan.CreatePayload): Promise<IPlan.Self> {
    const now = new Date();
    const rows = await knex<IPlan.Row>("plans").insert(
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
    const rows = await knex<IPlan.Row>("plans")
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
    await knex<IPlan.Row>("plans").delete().where("id", id);
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
    const query = builder.select().orderBy(this.column("created_at"), "desc");

    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.from(row));

    return { list, total };
  }

  from(row: IPlan.Row): IPlan.Self {
    return {
      id: row.id,
      weeklyMinutes: row.weekly_minutes,
      baseMonthlyPrice: row.base_monthly_price,
      monthDiscount: row.month_discount,
      quarterDiscount: row.quarter_discount,
      yearDiscount: row.year_discount,
      forInvitesOnly: row.for_invites_only,
      active: row.active,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IPlan.Row>(this.table) : knex<IPlan.Row>(this.table);
  }

  column(value: keyof IPlan.Row) {
    return column(value, this.table);
  }
}

export const plans = new Plans();
