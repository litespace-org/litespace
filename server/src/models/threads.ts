import { IReportThreads } from "@litespace/types";
import { knex } from "./query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";

export class Threads {
  async create(
    payload: IReportThreads.CreatePayload
  ): Promise<IReportThreads.Self> {
    const now = new Date();
    const rows = await knex<IReportThreads.Row>("report_threads").insert(
      {
        report_id: payload.reportId,
        message: payload.message,
        draft: payload.draft,
        created_at: now,
        created_by: payload.createdBy,
        updated_at: now,
        updated_by: payload.createdBy,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Report thread not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IReportThreads.UpdatePayload
  ): Promise<IReportThreads.Self> {
    const rows = await knex<IReportThreads.Row>("report_threads")
      .update(
        {
          message: payload.message,
          draft: payload.draft,
          updated_at: new Date(),
          updated_by: payload.updatedBy,
        },
        "*"
      )
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Report thread not found; should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IReportThreads.Row>("report_threads").delete().where("id", id);
  }

  async findById(id: number): Promise<IReportThreads.MappedAttributes | null> {
    const coupons = this.mapAttributesQuery(
      await this.getAttributesQuery().where("report_threads.id", id)
    );
    return first(coupons) || null;
  }

  async findAll(): Promise<IReportThreads.MappedAttributes[]> {
    return this.mapAttributesQuery(await this.getAttributesQuery());
  }

  getAttributesQuery() {
    return asAttributesQuery<IReportThreads.Row, IReportThreads.Attributed[]>(
      "report_threads",
      {
        id: "report_threads.id",
        reportId: "report_threads.report_id",
        message: "report_threads.message",
        draft: "report_threads.draft",
      }
    );
  }

  mapAttributesQuery(
    list: IReportThreads.Attributed[]
  ): IReportThreads.MappedAttributes[] {
    return mapAttributesQuery(list, (item) => ({}));
  }

  from(row: IReportThreads.Row): IReportThreads.Self {
    return {
      id: row.id,
      reportId: row.report_id,
      message: row.message,
      draft: row.draft,
      createdAt: row.created_at.toISOString(),
      createdBy: row.created_by,
      updatedAt: row.updated_at.toISOString(),
      updatedBy: row.updated_by,
    };
  }
}

export const threads = new Threads();
