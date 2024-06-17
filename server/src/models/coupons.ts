import { ICoupon, IPlan } from "@litespace/types";
import { knex } from "./query";
import { first, omit } from "lodash";
import dayjs from "@/lib/dayjs";

export class Coupons {
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

  async findById(id: number): Promise<ICoupon.MappedAttributes | null> {
    const plans = this.mapSelectQuery(
      await this.getSelectQuery().where("coupons.id", id)
    );
    return first(plans) || null;
  }

  async findAll(): Promise<ICoupon.MappedAttributes[]> {
    return this.mapSelectQuery(await this.getSelectQuery());
  }

  getSelectQuery() {
    return knex<ICoupon.Row>("coupons")
      .select<ICoupon.Attributed[]>({
        id: "coupons.id",
        code: "coupons.code",
        planId: "coupons.plan_id",
        fullMonthDiscount: "coupons.full_month_discount",
        fullQuarterDiscount: "coupons.full_quarter_discount",
        halfYearDiscount: "coupons.half_year_discount",
        fullYearDiscount: "coupons.full_year_discount",
        expiresAt: "coupons.expires_at",
        createdAt: "coupons.created_at",
        createdById: "coupons.created_by",
        createdByEmail: "creator.email",
        createdByName: "creator.name",
        updatedAt: "coupons.updated_at",
        updatedById: "coupons.updated_by",
        updatedByEmail: "updator.email",
        updatedByName: "updator.name",
      })
      .innerJoin("users AS creator", "creator.id", "coupons.created_by")
      .innerJoin("users AS updator", "updator.id", "coupons.updated_by")
      .clone();
  }

  // todo: impl. mapping util
  mapSelectQuery(list: ICoupon.Attributed[]): ICoupon.MappedAttributes[] {
    return list.map((plan) =>
      omit(
        {
          ...plan,
          createdBy: {
            id: plan.createdById,
            email: plan.createdByEmail,
            name: plan.createdByName,
          },
          updatedBy: {
            id: plan.updatedById,
            email: plan.updatedByEmail,
            name: plan.updatedByName,
          },
          createdAt: plan.createdAt.toISOString(),
          updatedAt: plan.updatedAt.toISOString(),
          expiresAt: plan.expiresAt.toISOString(),
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
}

export const coupons = new Coupons();
