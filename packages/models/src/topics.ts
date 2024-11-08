import { IFilter, ITopic, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { column, countRows, knex, withPagination } from "@/query";
import dayjs from "@/lib/dayjs";

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
    const topic = await this.builder(tx)
      .topics.insert({
        name_ar: payload.name.ar,
        name_en: payload.name.en,
        created_at: now,
        updated_at: now,
      })
      .returning("*")
      .first();
    if (!topic) throw new Error("Topic not found. Should never happen.");
    return this.from(topic);
  }

  async update(
    id: number,
    payload: ITopic.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<ITopic.Self> {
    const now = dayjs.utc().toDate();
    const topic = await this.builder(tx)
      .topics.update({
        name_ar: payload.arabicName,
        name_en: payload.englishName,
        updated_at: now,
      })
      .where(this.column.topics("id"), id)
      .returning("*")
      .first();

    if (!topic) throw new Error("Topic not found. Should never happen.");
    return this.from(topic);
  }

  async delete(id: number, tx: Knex.Transaction) {
    const { userTopics, topics } = this.builder(tx);
    await userTopics.delete().where(this.column.userTopics("topic_id"), id);
    await topics.delete().where(this.column.topics("id"), id);
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
          .whereILike(this.column.topics("name_ar"), name)
          .orWhereILike(this.column.topics("name_en"), name);
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
