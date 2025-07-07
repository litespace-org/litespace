import { IReport, Paginated } from "@litespace/types";
import {
  countRows,
  Select,
  withBooleanFilter,
  withDateFilter,
  withListFilter,
  withNullableFilter,
  WithOptionalTx,
  withSkippablePagination,
  withStringFilter,
} from "@/query";
import { first } from "lodash";
import dayjs from "dayjs";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  userId: "user_id",
  title: "title",
  description: "description",
  screenshot: "screenshot",
  log: "log",
  resolved: "resolved",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IReport.Field, IReport.Column>;

export class Reports extends Model<
  IReport.Row,
  IReport.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "reports",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

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

  async find<T extends IReport.Field = IReport.Field>({
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
    select,
    ...pagination
  }: WithOptionalTx<IReport.FindModelQuery<T>>): Promise<
    Paginated<Pick<IReport.Self, T>>
  > {
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
    const query = builder.select(this.select(select)).orderBy([
      {
        column: this.column("created_at"),
        order: "desc",
      },
      {
        column: this.column("id"),
        order: "desc",
      },
    ]);
    const rows = (await withSkippablePagination(query, pagination)) as Array<
      Select<IReport.Row, T, typeof FIELD_TO_COLUMN>
    >;
    const list = rows.map((row) => this.from<T>(row));

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
}

export const reports = new Reports();
