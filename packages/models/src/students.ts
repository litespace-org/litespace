import { first } from "lodash";
import { IStudent, Paginated } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Model } from "@/lib/model";
import {
  countRows,
  WithOptionalTx,
  withSkippablePagination,
  withStringFilter,
  withListFilter,
} from "@/query";

const FIELD_TO_COLUMN = {
  id: "id",
  userId: "id",
  jobTitle: "job_title",
  englishLevel: "english_level",
  learningObjective: "learning_objective",
  createdAt: "created_at",
  updatedAt: "updated_at",
  timePeriod: "time_period",
} satisfies Record<IStudent.Field, IStudent.Column>;

export class Students extends Model<
  IStudent.Row,
  IStudent.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({ table: "students", fieldColumnMap: FIELD_TO_COLUMN });
  }

  async create({
    tx,
    ...payload
  }: WithOptionalTx<IStudent.CreateModelPayload>): Promise<IStudent.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx).insert(
      {
        id: payload.userId,
        job_title: payload.jobTitle,
        english_level: payload.englishLevel,
        learning_objective: payload.learningObjective,
        time_period: payload.timePeriod,
        created_at: now,
        updated_at: now,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Student not found; should never happen");
    return this.from(row);
  }

  async update({
    id,
    tx,
    jobTitle,
    englishLevel,
    learningObjective,
    timePeriod,
  }: WithOptionalTx<IStudent.UpdateModelPayload>): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .update({
        job_title: jobTitle,
        english_level: englishLevel,
        learning_objective: learningObjective,
        time_period: timePeriod,
        updated_at: now,
      })
      .where(this.column("id"), id);
  }

  async findOneBy<T extends keyof IStudent.Row>(
    key: T,
    value: IStudent.Row[T]
  ): Promise<IStudent.Self | null> {
    const rows = await this.findManyBy(key, value);
    return first(rows) || null;
  }

  async findById(id: number): Promise<IStudent.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findManyBy<T extends keyof IStudent.Row>(
    key: T,
    value: IStudent.Row[T]
  ): Promise<IStudent.Self[]> {
    const rows = await this.builder().select("*").where(key, value);

    return rows.map((row) => this.from(row));
  }

  async find({
    tx,
    ids,
    jobTitle,
    englishLevels,
    learningObjective,
    timePeriods,
    ...pagination
  }: WithOptionalTx<IStudent.FindModelQuery>): Promise<
    Paginated<IStudent.Self>
  > {
    const builder = this.builder(tx);

    // ============== list-based fields ========
    withListFilter(builder, this.column("id"), ids);
    withListFilter(builder, this.column("english_level"), englishLevels);
    withListFilter(builder, this.column("time_period"), timePeriods);

    // ============== string fields ========
    withStringFilter(builder, this.column("job_title"), jobTitle);
    withStringFilter(
      builder,
      this.column("learning_objective"),
      learningObjective
    );

    const total = await countRows(builder.clone(), { distinct: true });
    const query = builder
      .select<IStudent.Row[]>("*")
      .orderBy(this.column("created_at"), "desc");
    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.from(row));

    return { list, total };
  }
}

export const students = new Students();
