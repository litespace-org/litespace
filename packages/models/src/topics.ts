import { IFilter, ITopic, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { column, countRows, knex, withPagination } from "@/query";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

export class Topics {
  readonly table = { topics: "topics", userTopics: "user_topics" } as const;
  readonly column = {
    topics: (value: keyof ITopic.Row) => column(value, this.table.topics),
    userTopics: (value: keyof ITopic.UserTopicsRow) =>
      column(value, this.table.userTopics),
  };

  async create(
    payload: ITopic.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<ITopic.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .topics.insert({
        name_ar: payload.name.ar,
        name_en: payload.name.en,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Topic not found. Should never happen.");
    return this.from(row);
  }

  async registerUserTopics(
    payload: ITopic.CreateUserTopicsPayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    await this.builder(tx).userTopics.insert(
      payload.topics.map((topic) => ({
        user_id: payload.user,
        topic_id: topic,
      }))
    );
  }

  async update(
    id: number,
    payload: ITopic.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<ITopic.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .topics.update({
        name_ar: payload.arabicName,
        name_en: payload.englishName,
        updated_at: now,
      })
      .where(this.column.topics("id"), id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Topic not found. Should never happen.");
    return this.from(row);
  }

  async delete(id: number, tx: Knex.Transaction) {
    const { userTopics, topics } = this.builder(tx);
    await userTopics.delete().where(this.column.userTopics("topic_id"), id);
    await topics.delete().where(this.column.topics("id"), id);
  }

  async deleteUserTopics({
    user,
    topic,
    tx,
  }: {
    user: number;
    topic: number;
    tx?: Knex.Transaction;
  }): Promise<void> {
    await this.builder(tx)
      .userTopics.delete()
      .where(this.column.userTopics("user_id"), user)
      .andWhere(this.column.userTopics("topic_id"), topic);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ITopic.Self | null> {
    const row = await this.builder(tx)
      .topics.select()
      .where(this.column.topics("id"), id)
      .first();
    if (!row) return null;
    return this.from(row);
  }

  async findTopicsOfTutors({
    tx,
    tutorsIds,
  }: {
    tx?: Knex.Transaction;
    tutorsIds: number[];
  }): Promise<Array<ITopic.Self & { userId: number }> | null> {

    const rows = await this.builder(tx)
    .topics.select()
    .join(
      this.table.userTopics, 
      this.column.userTopics("topic_id"),
      this.column.topics("id"))
    .whereIn(this.column.userTopics("user_id"), tutorsIds);

    if (!rows) return null;
    // user_id is probably required to map between topics and users (tutors)
    return rows.map( r => ({...this.from(r), userId: r["user_id"]}) );
  }

  async find({
    tx,
    name,
    orderBy = "created_at",
    orderDirection = IFilter.OrderDirection.Descending,
    page,
    size,
  }: ITopic.FindTopicsQueryFilter & {
    tx?: Knex.Transaction;
  }): Promise<Paginated<ITopic.Self>> {
    const baseBuilder = this.builder(tx).topics;

    if (name)
      baseBuilder.where((builder) => {
        builder
          .whereILike(this.column.topics("name_ar"), `%${name}%`)
          .orWhereILike(this.column.topics("name_en"), `%${name}%`);
      });

    const total = await countRows(baseBuilder.clone(), {
      column: this.column.topics("id"),
    });

    const queryBuilder = baseBuilder
      .clone()
      .orderBy(this.column.topics(orderBy), orderDirection);

    const rows = await withPagination(queryBuilder, { page, size });

    return {
      list: rows.map((row) => this.from(row)),
      total,
    };
  }

  builder(tx?: Knex.Transaction) {
    const builder = tx || knex;
    return {
      topics: builder<ITopic.Row>(this.table.topics),
      userTopics: builder<ITopic.UserTopicsRow>(this.table.userTopics),
    };
  }

  from(row: ITopic.Row): ITopic.Self {
    return {
      id: row.id,
      name: {
        ar: row.name_ar,
        en: row.name_en,
      },
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const topics = new Topics();
