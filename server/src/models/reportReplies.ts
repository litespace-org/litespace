import { IReportReply } from "@litespace/types";
import { knex } from "./query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";

export class ReportReplies {
  async create(
    payload: IReportReply.CreatePayload
  ): Promise<IReportReply.Self> {
    const now = new Date();
    const rows = await knex<IReportReply.Row>("report_replies").insert(
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
    payload: IReportReply.UpdatePayload
  ): Promise<IReportReply.Self> {
    const rows = await knex<IReportReply.Row>("report_replies")
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
    await knex<IReportReply.Row>("report_replies").delete().where("id", id);
  }

  async findById(id: number): Promise<IReportReply.MappedAttributes | null> {
    const list = this.mapAttributesQuery(
      await this.getAttributesQuery().where("report_replies.id", id)
    );
    return first(list) || null;
  }

  async findByReportId(id: number): Promise<IReportReply.MappedAttributes[]> {
    return this.mapAttributesQuery(
      await this.getAttributesQuery().where("report_replies.report_id", id)
    );
  }

  async findAll(): Promise<IReportReply.MappedAttributes[]> {
    return this.mapAttributesQuery(await this.getAttributesQuery());
  }

  getAttributesQuery() {
    return asAttributesQuery<IReportReply.Row, IReportReply.Attributed[]>(
      "report_replies",
      {
        id: "report_replies.id",
        reportId: "report_replies.report_id",
        message: "report_replies.message",
        draft: "report_replies.draft",
      }
    );
  }

  mapAttributesQuery(
    list: IReportReply.Attributed[]
  ): IReportReply.MappedAttributes[] {
    return mapAttributesQuery(list, (item) => ({}));
  }

  from(row: IReportReply.Row): IReportReply.Self {
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

export const reportReplies = new ReportReplies();
