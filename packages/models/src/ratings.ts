import { first } from "lodash";
import { column, countRows, knex, withPagination } from "@/query";
import { IFilter, IRating, IUser, NumericString, Paginated } from "@litespace/types";
import { Knex } from "knex";
import zod from "zod";
import { Pagination } from "@litespace/types/dist/esm/filter";

export class Ratings {
  table = "ratings" as const;
  rater = "rater" as const;
  ratee = "ratee" as const;

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
    value: IRating.Row[T],
    pagination?: IFilter.Pagination
  ): Promise<Paginated<IRating.Populated>> {
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

    const query = this.builder()
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
      .where(this.column.ratings(key), value);

    const totalQuery = knex.count().from(query);
    const totalRow = await totalQuery.first();
    const total = totalRow ? zod.coerce.number().parse(totalRow.count) : 0;

    const rows = await withPagination(query.clone(), pagination);
    return { list: rows.map((row) => this.asPopulated(row)), total };
  }

  async findOneBy<T extends keyof IRating.Row>(
    key: T,
    value: IRating.Row[T]
  ): Promise<IRating.Populated | null> {
    const ratings = await this.findManyBy(key, value);
    if (ratings.list.length > 1)
      throw new Error("too many ratings found; expecting one");
    return first(ratings.list) || null;
  }

  async findById(id: number): Promise<IRating.Populated | null> {
    return await this.findOneBy("id", id);
  }

  async findSelfById(id: number): Promise<IRating.Self | null> {
    const row = await knex<IRating.Row>(this.table)
      .select("*")
      .where(this.column.ratings("id"), id)
      .first();

    if (!row) return null;
    return this.from(row);
  }

  async findByRaterId(id: number): Promise<Paginated<IRating.Populated>> {
    return await this.findManyBy("rater_id", id);
  }

  async findByRateeId(id: number): Promise<Paginated<IRating.Populated>> {
    return await this.findManyBy("ratee_id", id);
  }

  async findByRaterAndRateeIds(
    raterId: number,
    rateeId: number
  ): Promise<IRating.PublicTutorRating | undefined> {
    const select: Record<keyof IRating.PublicTutorRating, string> = {
      id: this.column.ratings("id"),
      userId: this.column.rater("id"),
      name: this.column.rater("name"),
      image: this.column.rater("image"),
      value: this.column.ratings("value"),
      feedback: this.column.ratings("feedback"),
    };

    const row = await this.builder()
      .select<IRating.PublicTutorRating[]>(select)
      .innerJoin(
        "users AS rater",
        this.column.rater("id"),
        this.column.ratings("rater_id")
      )
      .where(this.column.ratings("rater_id"), raterId)
      .andWhere(this.column.ratings("ratee_id"), rateeId)
      .first();

    return row;
  }

  /**
  * This is a concrete or specific function that's only expected to work
  * with tutors whereas it orders rows in a specific order.
  */
  async findOrderedTutorRatings(
    tutorId: number,
    pagination?: Pagination
  ): Promise<Paginated<IRating.PublicTutorRating>> {
    const select: Record<keyof IRating.PublicTutorRating, string> = {
      id: this.column.ratings("id"),
      userId: this.column.rater("id"),
      name: this.column.rater("name"),
      image: this.column.rater("image"),
      value: this.column.ratings("value"),
      feedback: this.column.ratings("feedback"),
    };

    const query = this.builder()
      .select<IRating.PublicTutorRating[]>(select)
      .innerJoin(
        "users AS rater",
        this.column.rater("id"),
        this.column.ratings("rater_id")
      )
      .where(this.column.ratings("ratee_id"), tutorId)
      .orderByRaw("value DESC, LENGTH(feedback) DESC NULLS LAST, ratings.created_at DESC");

    const totalQuery = knex.count().from(query);
    const totalRow = await totalQuery.first();
    const total = totalRow ? zod.coerce.number().parse(totalRow.count) : 0;

    const rows = await withPagination(query.clone(), pagination);
    return { list: rows, total };
  }

  async find({
    page,
    size,
    tx,
  }: { tx?: Knex.Transaction } & IFilter.Pagination): Promise<
    Paginated<IRating.Self>
  > {
    const builder = this.builder(tx);
    const total = await countRows(builder.clone());
    const rows = await withPagination(builder.clone().select(), { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  async findByEntities(ids: {
    rater: number;
    ratee: number;
  }): Promise<IRating.Self | null> {
    const rows = await knex<IRating.Row>(this.table)
      .select("*")
      .where(this.column.ratings("rater_id"), ids.rater)
      .andWhere(this.column.ratings("ratee_id"), ids.ratee);

    if (rows.length > 1)
      throw new Error("too many ratings found; expecting one");

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findAvgRatings(users: number[]): Promise<IRating.FindAvgRatingResult> {
    const rows = await this.builder()
      .select({ user: this.column.ratings("ratee_id") })
      .avg<Array<{ user: number; avg: string }>>({
        avg: this.column.ratings("value"),
      })
      .whereIn(this.column.ratings("ratee_id"), users)
      .groupBy(this.column.ratings("ratee_id"));

    return rows.map((row) => ({
      user: row.user,
      avg: zod.coerce.number().parse(row.avg),
    }));
  }

  async findAvgUserRatings(user: number): Promise<number> {
    const ratings = await this.findAvgRatings([user]);
    const rating = first(ratings);
    if (!rating) return 0;
    return rating.avg;
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

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IRating.Row>(this.table) : knex<IRating.Row>(this.table);
  }
}

export const ratings = new Ratings();
