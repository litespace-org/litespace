import { IInterview } from "@litespace/types";
import { knex } from "@/models/query";
import { first } from "lodash";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";

export class Interviews {
  table = "interviews";

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
        interviewer_note: payload.interviewerNote,
        score: payload.score,
        passed: payload.passed,
        passed_at: payload.passed !== undefined ? now : undefined,
        approved: payload.approved,
        approved_at: payload.approved !== undefined ? now : undefined,
        approved_by: payload.approvedBy,
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

  async findByUser(id: number): Promise<IInterview.Self[]> {
    const rows = await knex<IInterview.Row>(this.table)
      .select("*")
      .where("interviewer_id", id)
      .orWhere("interviewee_id", id);
    return rows.map((row) => this.from(row));
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
      interviewerNote: row.interviewer_note,
      score: row.score,
      passed: row.passed,
      passedAt: row.passed_at ? row.passed_at.toISOString() : null,
      approved: row.approved,
      approvedAt: row.approved_at ? row.approved_at.toISOString() : null,
      approvedBy: row.approved_by,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IInterview.Row>(this.table).clone()
      : knex<IInterview.Row>(this.table).clone();
  }
}

export const interviews = new Interviews();
