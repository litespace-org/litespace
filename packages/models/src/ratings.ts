import { first } from "lodash";
import { column, knex } from "@/query";
import { IRating, IUser } from "@litespace/types";

export class Ratings {
  table = "ratings";
  rater = "rater";
  ratee = "ratee";

  column = {
    ratings: (value: keyof IRating.Row) => column(value, this.table),
    rater: (value: keyof IUser.Row) => column(value, this.rater),
    ratee: (value: keyof IUser.Row) => column(value, this.ratee),
  };

  async create(rating: IRating.CreatePayload): Promise<IRating.Self> {
    const now = new Date();
    const rows = await knex<IRating.Row>(this.table).insert(
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
    const rows = await knex<IRating.Row>(this.table)
      .update(payload, "*")
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Rating not found, should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<IRating.Self> {
    const rows = await knex<IRating.Row>(this.table)
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
    const select: Record<keyof IRating.PopulatedRow, string> = {
      id: this.column.ratings("id"),
      raterId: this.column.rater("id"),
      raterName: this.column.rater("name"),
      raterImage: this.column.rater("image"),
      rateeId: this.column.ratee("id"),
      rateeName: this.column.ratee("name"),
      rateeImage: this.column.ratee("image"),
      value: this.column.ratings("value"),
      feedback: this.column.ratings("feedback"),
      createdAt: this.column.ratings("created_at"),
      updatedAt: this.column.ratings("updated_at"),
    };

    const rows = await knex<IRating.Row>(this.table)
      .select<IRating.PopulatedRow[]>(select)
      .innerJoin(
        "users AS rater",
        this.column.rater("id"),
        this.column.ratings("rater_id")
      )
      .innerJoin(
        "users AS ratee",
        this.column.ratee("id"),
        this.column.ratings("ratee_id")
      )
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
    const rows = await knex<IRating.Row>(this.table).select("*");
    return rows.map((row) => this.from(row));
  }

  async findByEntities(ids: {
    rater: number;
    ratee: number;
  }): Promise<IRating.Self | null> {
    const rows = await knex<IRating.Row>(this.table)
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
      rater: { id: row.raterId, name: row.raterName, image: row.raterImage },
      ratee: { id: row.rateeId, name: row.rateeName, image: row.rateeImage },
      value: row.value,
      feedback: row.feedback,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export const ratings = new Ratings();