import { ICoupon, IFilter, Paginated } from "@litespace/types";
import { countRows, knex, withPagination } from "@/query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";
import { Knex } from "knex";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  code: "code",
  planId: "plan_id",
  expiresAt: "expires_at",
  fullMonthDiscount: "full_month_discount",
  fullQuarterDiscount: "full_quarter_discount",
  fullYearDiscount: "full_year_discount",
  halfYearDiscount: "half_year_discount",
  createdAt: "created_at",
  createdBy: "created_by",
  updatedAt: "updated_at",
  updatedBy: "updated_by",
} satisfies Record<ICoupon.Field, ICoupon.Column>;

export class Coupons extends Model<
  ICoupon.Row,
  ICoupon.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "coupons",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

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
}

export const coupons = new Coupons();
