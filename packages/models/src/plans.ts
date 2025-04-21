import { IFilter, IPlan, Paginated } from "@litespace/types";
import { column, countRows, knex, withPagination } from "@/query";
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
    return row ? this.from(row) : null;
  }

  async find({
    tx,
    page,
    size,
  }: { tx?: Knex.Transaction } & IFilter.Pagination): Promise<
    Paginated<IPlan.Self>
  > {
    const total = await countRows(this.builder(tx));
    const rows = await withPagination(this.builder(tx).select(), {
      page,
      size,
    });
    return {
      list: rows.map((row) => this.from(row)),
      total,
    };
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
