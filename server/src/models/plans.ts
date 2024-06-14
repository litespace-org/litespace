import { IPlan } from "@litespace/types";
import { knex } from "@/models/query";
import { first } from "lodash";

export class Plans {
  async create(payload: IPlan.CreatePayload): Promise<IPlan.Self> {
    const now = new Date();
    const rows = await knex<IPlan.Row>("plans").insert(
      {
        weekly_minutes: payload.weeklyMinutes,
        full_month_price: payload.fullMonthPrice,
        full_quarter_price: payload.fullQuarterPrice,
        half_year_price: payload.halfYearPrice,
        full_year_price: payload.fullyearPrice,
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

  async update(id: number, payload: IPlan.UpdatePayload) {
    const rows = await knex<IPlan.Row>("plans")
      .update(
        {
          weekly_minutes: payload.weeklyMinutes,
          full_month_price: payload.fullMonthPrice,
          full_quarter_price: payload.fullQuarterPrice,
          half_year_price: payload.halfYearPrice,
          full_year_price: payload.fullyearPrice,
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

  async findById(id: number): Promise<IPlan.Attributed | null> {
    const plans = await this.getSelectQuery().where("id", id);
    return first(plans) || null;
  }

  async findAll(): Promise<IPlan.Attributed[]> {
    return await this.getSelectQuery();
  }

  getSelectQuery() {
    return knex<IPlan.Row>({ plans: "plans" })
      .select<IPlan.Attributed[]>({
        id: "plans.id",
        weeklyMinutes: "plans.weekly_minutes",
        fullMonthPrice: "full_month_price",
        fullQuarterPrice: "full_quarter_price",
        halfYearPrice: "half_year_price",
        fullyearPrice: "full_year_price",
        fullMonthDiscount: "full_month_discount",
        fullQuarterDiscount: "full_quarter_discount",
        halfYearDiscount: "half_year_discount",
        fullYearDiscount: "full_year_discount",
        forInvitesOnly: "for_invites_only",
        active: "active",
        createdAt: "plans.created_at",
        createdById: "plans.created_by",
        createdByEmail: "creator.email",
        createdByName: "creator.name",
        updatedAt: "plans.updated_at",
        updatedById: "plans.updated_by",
        updatedByEmail: "updator.email",
        updatedByName: "updator.name",
      })
      .innerJoin("users AS creator", "users.id", "plans.created_by")
      .innerJoin("users AS updator", "users.id", "plans.updated_by")
      .clone();
  }

  from(row: IPlan.Row): IPlan.Self {
    return {
      id: row.id,
      weeklyMinutes: row.weekly_minutes,
      fullMonthPrice: row.full_month_price,
      fullQuarterPrice: row.full_quarter_price,
      halfYearPrice: row.half_year_price,
      fullyearPrice: row.full_year_price,
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
}

export const plans = new Plans();
