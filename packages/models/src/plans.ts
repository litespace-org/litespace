import { IFilter, IPlan, Paginated } from "@litespace/types";
import { countRows, knex, withPagination } from "@/query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";
import { Knex } from "knex";

export class Plans {
  table = "plans" as const;

  async create(payload: IPlan.CreatePayload): Promise<IPlan.Self> {
    const now = new Date();
    const rows = await knex<IPlan.Row>("plans").insert(
      {
        alias: payload.alias,
        weekly_minutes: payload.weeklyMinutes,
        full_month_price: payload.fullMonthPrice,
        full_quarter_price: payload.fullQuarterPrice,
        half_year_price: payload.halfYearPrice,
        full_year_price: payload.fullYearPrice,
        full_month_discount: payload.fullMonthDiscount,
        full_quarter_discount: payload.fullQuarterDiscount,
        half_year_discount: payload.halfYearDiscount,
        full_year_discount: payload.fullYearDiscount,
        for_invites_only: payload.forInvitesOnly,
        active: payload.active,
        created_at: now,
        created_by: payload.createdBy,
        updated_at: now,
        updated_by: payload.createdBy,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Plan not found; should never happen");
    return this.from(row);
  }

  async update(id: number, payload: IPlan.UpdatePayload): Promise<IPlan.Self> {
    const rows = await knex<IPlan.Row>("plans")
      .update(
        {
          weekly_minutes: payload.weeklyMinutes,
          full_month_price: payload.fullMonthPrice,
          full_quarter_price: payload.fullQuarterPrice,
          half_year_price: payload.halfYearPrice,
          full_year_price: payload.fullYearPrice,
          full_month_discount: payload.fullMonthDiscount,
          full_quarter_discount: payload.fullQuarterDiscount,
          half_year_discount: payload.halfYearDiscount,
          full_year_discount: payload.fullYearDiscount,
          for_invites_only: payload.forInvitesOnly,
          active: payload.active,
          updated_by: payload.updatedBy,
          updated_at: new Date(),
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

  async findById(id: number): Promise<IPlan.MappedAttributes | null> {
    const plans = this.mapAttributesQuery(
      await this.getAttributesQuery().where("plans.id", id)
    );

    return first(plans) || null;
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

  getAttributesQuery() {
    return asAttributesQuery<IPlan.Row, IPlan.Attributed[]>("plans", {
      id: "plans.id",
      alias: "plans.alias",
      weeklyMinutes: "plans.weekly_minutes",
      fullMonthPrice: "plans.full_month_price",
      fullQuarterPrice: "plans.full_quarter_price",
      halfYearPrice: "plans.half_year_price",
      fullYearPrice: "plans.full_year_price",
      fullMonthDiscount: "plans.full_month_discount",
      fullQuarterDiscount: "plans.full_quarter_discount",
      halfYearDiscount: "plans.half_year_discount",
      fullYearDiscount: "plans.full_year_discount",
      forInvitesOnly: "plans.for_invites_only",
      active: "plans.active",
    });
  }

  mapAttributesQuery(list: IPlan.Attributed[]): IPlan.MappedAttributes[] {
    return mapAttributesQuery(list, () => ({}));
  }

  from(row: IPlan.Row): IPlan.Self {
    return {
      id: row.id,
      alias: row.alias,
      weeklyMinutes: row.weekly_minutes,
      fullMonthPrice: row.full_month_price,
      fullQuarterPrice: row.full_quarter_price,
      halfYearPrice: row.half_year_price,
      fullYearPrice: row.full_year_price,
      fullMonthDiscount: row.full_month_discount,
      fullQuarterDiscount: row.full_quarter_discount,
      halfYearDiscount: row.half_year_discount,
      fullYearDiscount: row.full_year_discount,
      forInvitesOnly: row.for_invites_only,
      active: row.active,
      createdAt: row.created_at.toISOString(),
      createdBy: row.created_by,
      updatedAt: row.updated_at.toISOString(),
      updatedBy: row.updated_by,
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IPlan.Row>(this.table) : knex<IPlan.Row>(this.table);
  }
}

export const plans = new Plans();
