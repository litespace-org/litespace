import { ICoupon, IFilter, Paginated } from "@litespace/types";
import { column, countRows, knex, withPagination } from "@/query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";
import { Knex } from "knex";

export class Coupons {
  table = "coupons" as const;

  async create(payload: ICoupon.CreatePayload): Promise<ICoupon.Self> {
    const now = new Date();
    const rows = await knex<ICoupon.Row>("coupons").insert(
      {
        code: payload.code,
        plan_id: payload.planId,
        full_month_discount: payload.fullMonthDiscount,
        full_quarter_discount: payload.fullQuarterDiscount,
        half_year_discount: payload.halfYearDiscount,
        full_year_discount: payload.fullYearDiscount,
        expires_at: new Date(payload.expiresAt),
        created_at: now,
        created_by: payload.createdBy,
        updated_at: now,
        updated_by: payload.createdBy,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Coupon not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: ICoupon.UpdatePayload
  ): Promise<ICoupon.Self> {
    const rows = await knex<ICoupon.Row>("coupons")
      .update(
        {
          code: payload.code,
          plan_id: payload.planId,
          full_month_discount: payload.fullMonthDiscount,
          full_quarter_discount: payload.fullQuarterDiscount,
          half_year_discount: payload.halfYearDiscount,
          full_year_discount: payload.fullYearDiscount,
          expires_at: payload.expiresAt
            ? new Date(payload.expiresAt)
            : undefined,
          updated_at: new Date(),
          updated_by: payload.updatedBy,
        },
        "*"
      )
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Coupon not found; should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<ICoupon.Row>("coupons").delete().where("id", id);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ICoupon.Self | null> {
    const coupon = await this.builder(tx)
      .select()
      .where(this.column("id"), id)
      .first();
    if (!coupon) return null;
    return this.from(coupon);
  }

  async findByCode(
    code: string,
    tx?: Knex.Transaction
  ): Promise<ICoupon.Self | null> {
    const coupon = await this.builder(tx)
      .select()
      .where(this.column("code"), code)
      .first();
    if (!coupon) return null;
    return this.from(coupon);
  }

  async find({
    page,
    size,
    tx,
  }: IFilter.Pagination & { tx?: Knex.Transaction }): Promise<
    Paginated<ICoupon.Self>
  > {
    const total = await countRows(this.builder(tx));
    const rows = await withPagination(this.builder(tx).select(), {
      page,
      size,
    });
    return { list: rows.map((row) => this.from(row)), total };
  }

  getAttributesQuery() {
    return asAttributesQuery<ICoupon.Row, ICoupon.Attributed[]>("coupons", {
      id: "coupons.id",
      code: "coupons.code",
      planId: "coupons.plan_id",
      fullMonthDiscount: "coupons.full_month_discount",
      fullQuarterDiscount: "coupons.full_quarter_discount",
      halfYearDiscount: "coupons.half_year_discount",
      fullYearDiscount: "coupons.full_year_discount",
      expiresAt: "coupons.expires_at",
    });
  }

  mapAttributesQuery(list: ICoupon.Attributed[]): ICoupon.MappedAttributes[] {
    return mapAttributesQuery(list, (item) => ({
      expiresAt: item.expiresAt.toISOString(),
    }));
  }

  from(row: ICoupon.Row): ICoupon.Self {
    return {
      id: row.id,
      code: row.code,
      planId: row.plan_id,
      fullMonthDiscount: row.full_month_discount,
      fullQuarterDiscount: row.full_quarter_discount,
      halfYearDiscount: row.half_year_discount,
      fullYearDiscount: row.full_year_discount,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      createdBy: row.created_by,
      updatedAt: row.updated_at.toISOString(),
      updatedBy: row.updated_by,
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<ICoupon.Row>(this.table) : knex<ICoupon.Row>(this.table);
  }

  column(value: keyof ICoupon.Row) {
    return column(value, this.table);
  }
}

export const coupons = new Coupons();
