import { IFilter, IInterview } from "@litespace/types";
import { column, countRows, knex, withPagination } from "@/query";
import { first } from "lodash";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";

export class Interviews {
  readonly table = "interviews" as const;

  async create(
    payload: IInterview.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<IInterview.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        interviewer_id: payload.interviewer,
        interviewee_id: payload.interviewee,
        call_id: payload.call,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Interview not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IInterview.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<IInterview.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .update({
        interviewer_feedback: payload.feedback?.interviewer,
        interviewee_feedback: payload.feedback?.interviewee,
        note: payload.note,
        score: payload.score,
        signer: payload.signer,
        status: payload.status,
        updated_at: now,
      })
      .where("id", id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Interview not found; should never happen");
    return this.from(row);
  }

  async findOneBy<T extends keyof IInterview.Row>(
    key: T,
    value: IInterview.Row[T]
  ): Promise<IInterview.Self | null> {
    const interviews = await this.findManyBy(key, value);
    return first(interviews) || null;
  }

  async findManyBy<T extends keyof IInterview.Row>(
    key: T,
    value: IInterview.Row[T]
  ): Promise<IInterview.Self[]> {
    const rows = await knex<IInterview.Row>(this.table)
      .select("*")
      .where(key, value);
    return rows.map((row) => this.from(row));
  }

  async findById(id: number): Promise<IInterview.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findByInterviewee(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("interviewee_id", id);
  }

  async findByInterviewer(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("interviewer_id", id);
  }

  async findByUser(
    id: number,
    pagination?: IFilter.Pagination,
    tx?: Knex.Transaction
  ): Promise<{ total: number; interviews: IInterview.Self[] }> {
    const builder = this.builder(tx)
      .where(this.column("interviewer_id"), id)
      .orWhere(this.column("interviewee_id"), id);
    const total = await countRows(builder.clone());
    const rows = await withPagination(builder.clone(), pagination).then();
    return { interviews: rows.map((row) => this.from(row)), total };
  }

  from(row: IInterview.Row): IInterview.Self {
    return {
      ids: {
        self: row.id,
        interviewer: row.interviewer_id,
        interviewee: row.interviewee_id,
        call: row.call_id,
      },
      feedback: {
        interviewer: row.interviewer_feedback,
        interviewee: row.interviewee_feedback,
      },
      note: row.note,
      score: row.score,
      status: row.status,
      signer: row.signer,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IInterview.Row>(this.table).clone()
      : knex<IInterview.Row>(this.table).clone();
  }

  column(value: keyof IInterview.Row): string {
    return column(value, this.table);
  }
}

export const interviews = new Interviews();
