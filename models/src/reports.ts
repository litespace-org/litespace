import { IReport } from "@litespace/types";
import { knex } from "@/query";
import { first } from "lodash";
import { asAttributesQuery, mapAttributesQuery } from "@/lib/query";

export class Reports {
  async create(payload: IReport.CreatePayload): Promise<IReport.Self> {
    const now = new Date();
    const rows = await knex<IReport.Row>("reports").insert(
      {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        created_at: now,
        created_by: payload.createdBy,
        updated_at: now,
        updated_by: payload.createdBy,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Report not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IReport.UpdatePayload
  ): Promise<IReport.Self> {
    const rows = await knex<IReport.Row>("reports")
      .update(
        {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          resolved: payload.resolved,
          resolved_at: payload.resolved ? new Date() : undefined,
          updated_at: new Date(),
          updated_by: payload.updatedBy,
        },
        "*"
      )
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Report not found; should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IReport.Row>("reports").delete().where("id", id);
  }

  async findById(id: number): Promise<IReport.MappedAttributes | null> {
    const list = this.mapAttributesQuery(
      await this.getAttributesQuery().where("reports.id", id)
    );
    return first(list) || null;
  }

  async findAll(): Promise<IReport.MappedAttributes[]> {
    return this.mapAttributesQuery(await this.getAttributesQuery());
  }

  getAttributesQuery() {
    return asAttributesQuery<IReport.Row, IReport.Attributed[]>("reports", {
      id: "reports.id",
      title: "reports.title",
      description: "reports.description",
      category: "reports.category",
      resolved: "reports.resolved",
      resolvedAt: "reports.resolved_at",
    });
  }

  mapAttributesQuery(list: IReport.Attributed[]): IReport.MappedAttributes[] {
    return mapAttributesQuery(list, (item) => ({
      resolvedAt: item.resolvedAt ? item.resolvedAt.toISOString() : null,
    }));
  }

  from(row: IReport.Row): IReport.Self {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      resolved: row.resolved,
      resolvedAt: row.resolved_at ? row.resolved_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      createdBy: row.created_by,
      updatedAt: row.updated_at.toISOString(),
      updatedBy: row.updated_by,
    };
  }
}

export const reports = new Reports();
