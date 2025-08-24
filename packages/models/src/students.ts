import { first } from "lodash";
import { Knex } from "knex";

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
} satisfies Record<IStudent.Field, IStudent.Column>;

export class Students extends Model<
  IStudent.Row,
  IStudent.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({ table: "students", fieldColumnMap: FIELD_TO_COLUMN });
  }

  async create(
    payload: IStudent.CreateModelPayload,
    tx?: Knex.Transaction
  ): Promise<IStudent.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx).insert(
      {
        // set id to user id (foreign key)
        id: payload.userId,
        job_title: payload.jobTitle,
        english_level: payload.englishLevel,
        learning_objective: payload.learningObjective,
        created_at: now,
        updated_at: now,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Student not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IStudent.UpdateModelPayload,
    tx?: Knex.Transaction
  ) {
    const now = dayjs.utc().toDate();
    await this.builder(tx).where("id", id).update({
      job_title: payload.jobTitle,
      english_level: payload.englishLevel,
      learning_objective: payload.learningObjective,
      updated_at: now,
    });
  }

  async find<T extends IStudent.Field = IStudent.Field>({
    tx,
    userIds,
    jobTitle,
    englishLevels,
    learningObjective,
    select,
    ...pagination
  }: WithOptionalTx<IStudent.FindModelQuery<T>>): Promise<
    Paginated<Pick<IStudent.Self, T>>
  > {
    const base = this.builder(tx);
    // filter by student id (which now references user id)
    withListFilter(base, this.column("id"), userIds);
    withStringFilter(base, this.column("job_title"), jobTitle);
    withListFilter(base, this.column("english_level"), englishLevels);
    withStringFilter(
      base,
      this.column("learning_objective"),
      learningObjective
    );
    const total = await countRows(base.clone(), {
      column: this.column("id"),
      distinct: true,
    });
    const query = base
      .clone()
      .select<IStudent.Row[]>(this.select(select))
      .orderBy([
        { column: this.column("created_at"), order: "desc" },
        { column: this.column("id"), order: "desc" },
      ]);
    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.from<T>(row));
    return { list, total };
  }
}

export const students = new Students();
