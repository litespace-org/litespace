import { first } from "lodash";
import { knex } from "@/query";
import { IRating } from "@litespace/types";

export class Ratings {
  name = "ratings";

  async create(rating: IRating.CreatePayload): Promise<IRating.Self> {
    const now = new Date();
    const rows = await knex<IRating.Row>(this.name).insert(
      {
        rater_id: rating.raterId,
        ratee_id: rating.rateeId,
        value: rating.value,
        feedback: rating.feedback,
        created_at: now,
        updated_at: now,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Rating not found, should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IRating.UpdatePayload
  ): Promise<IRating.Self> {
    const rows = await knex<IRating.Row>(this.name)
      .update(payload, "*")
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Rating not found, should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<IRating.Self> {
    const rows = await knex<IRating.Row>(this.name)
      .where("id", id)
      .delete()
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Rating not found, should never happen");
    return this.from(row);
  }

  async findManyBy<T extends keyof IRating.Row>(
    key: T,
    value: IRating.Row[T]
  ): Promise<IRating.Populated[]> {
    const rows = await knex<IRating.Row>(this.name)
      .select<IRating.PopulatedRow[]>({
        id: "ratings.id",
        raterId: "rater.id",
        raterArabicName: "rater.name_ar",
        raterEnglishName: "rater.name_en",
        raterPhoto: "rater.photo",
        rateeId: "ratee.id",
        rateeArabicName: "ratee.name_ar",
        rateeEnglishName: "ratee.name_en",
        rateePhoto: "ratee.photo",
        value: "ratings.value",
        feedback: "ratings.feedback",
        createdAt: "ratings.created_at",
        updatedAt: "ratings.updated_at",
      })
      .innerJoin("users AS rater", "rater.id", "ratings.rater_id")
      .innerJoin("users AS ratee", "ratee.id", "ratings.ratee_id")
      .where(key, value);
    return rows.map((row) => this.asPopulated(row));
  }

  async findOneBy<T extends keyof IRating.Row>(
    key: T,
    value: IRating.Row[T]
  ): Promise<IRating.Populated | null> {
    const ratings = await this.findManyBy(key, value);
    if (ratings.length > 1)
      throw new Error("too many ratings found; expecting one");
    return first(ratings) || null;
  }

  async findById(id: number): Promise<IRating.Populated | null> {
    return await this.findOneBy("id", id);
  }

  async findByRaterId(id: number): Promise<IRating.Populated[] | null> {
    return await this.findManyBy("rater_id", id);
  }

  async findByRateeId(id: number): Promise<IRating.Populated[] | null> {
    return await this.findManyBy("ratee_id", id);
  }

  async findAll(): Promise<IRating.Self[]> {
    const rows = await knex<IRating.Row>(this.name).select("*");
    return rows.map((row) => this.from(row));
  }

  async findByEntities(ids: {
    rater: number;
    ratee: number;
  }): Promise<IRating.Self | null> {
    const rows = await knex<IRating.Row>(this.name)
      .select("*")
      .where("rater_id", ids.rater)
      .orWhere("ratee_id", ids.ratee);

    if (rows.length > 1)
      throw new Error("too many ratings found; expecting one");

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  from(row: IRating.Row): IRating.Self {
    return {
      id: row.id,
      raterId: row.rater_id,
      rateeId: row.ratee_id,
      value: row.value,
      feedback: row.feedback,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asPopulated(row: IRating.PopulatedRow): IRating.Populated {
    return {
      id: row.id,
      rater: {
        id: row.raterId,
        name: { ar: row.raterArabicName, en: row.raterEnglishName },
        photo: row.raterPhoto,
      },
      ratee: {
        id: row.rateeId,
        name: { ar: row.rateeArabicName, en: row.rateeEnglishName },
        photo: row.rateePhoto,
      },
      value: row.value,
      feedback: row.feedback,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export const ratings = new Ratings();
