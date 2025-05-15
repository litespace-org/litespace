import { IReport, Paginated } from "@litespace/types";
import {
  column,
  countRows,
  knex,
  withBooleanFilter,
  withDateFilter,
  withListFilter,
  withNullableFilter,
  WithOptionalTx,
  withSkippablePagination,
  withStringFilter,
} from "@/query";
import { first } from "lodash";
import { Knex } from "knex";
import dayjs from "dayjs";

export class Reports {
  table = "reports";

  async create(
    payload: WithOptionalTx<IReport.CreateModelPayload>
  ): Promise<IReport.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder().insert(
      {
        user_id: payload.userId,
        title: payload.title,
        description: payload.description,
        screenshot: payload.screenshot,
        log: payload.log,
        resolved: false,
        created_at: now,
        updated_at: now,
      },
      "*"
    );
    const row = first(rows);
    if (!row) throw new Error("Report not found; should never happen");
    return this.from(row);
  }

  async update(
    payload: WithOptionalTx<IReport.UpdateModelPayload>
  ): Promise<void> {
    const now = dayjs().utc();
    await this.builder()
      .update({
        resolved: payload.resolved,
        updated_at: now.toDate(),
      })
      .where(this.column("id"), payload.id);
  }

  async find({
    tx,
    ids,
    users,
    title,
    description,
    screenshot,
    log,
    resolved,
    createdAt,
    updatedAt,
    ...pagination
  }: WithOptionalTx<IReport.FindModelQuery>): Promise<Paginated<IReport.Self>> {
    const builder = this.builder(tx).from<IReport.Row>(this.table);

    // ============== string fields ========
    withStringFilter(builder, this.column("title"), title);
    withStringFilter(builder, this.column("description"), description);

    // ============== boolean fields ========
    withBooleanFilter(builder, this.column("resolved"), resolved);

    // ============== nullable fields ========
    withNullableFilter(builder, this.column("screenshot"), screenshot);
    withNullableFilter(builder, this.column("log"), log);

    // ============== date fields ========
    withDateFilter(builder, this.column("created_at"), createdAt);
    withDateFilter(builder, this.column("updated_at"), updatedAt);

    // ==============  list-based fileds ========
    withListFilter(builder, this.column("id"), ids);
    withListFilter(builder, this.column("user_id"), users);

    const total = await countRows(builder.clone(), { distinct: true });
    const query = builder.select<IReport.Row[]>("*").orderBy([
      {
        column: this.column("created_at"),
        order: "desc",
      },
      {
        column: this.column("id"),
        order: "desc",
      },
    ]);
    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.from(row));

    return { list, total };
  }

  async findById(id: number): Promise<IReport.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findOneBy<T extends keyof IReport.Row>(
    key: T,
    value: IReport.Row[T]
  ): Promise<IReport.Self | null> {
    const interviews = await this.findManyBy(key, value);
    return first(interviews) || null;
  }

  async findManyBy<T extends keyof IReport.Row>(
    key: T,
    value: IReport.Row[T]
  ): Promise<IReport.Self[]> {
    const rows = await this.builder().select("*").where(key, value);
    return rows.map((row) => this.from(row));
  }

  from(row: IReport.Row): IReport.Self {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      screenshot: row.screenshot,
      log: row.log,
      resolved: row.resolved,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    const builder = tx || knex;
    return builder<IReport.Row>(this.table);
  }

  column(value: keyof IReport.Row) {
    return column(value, this.table);
  }
}

export const reports = new Reports();
