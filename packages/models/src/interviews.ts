import { IInterview, Paginated } from "@litespace/types";
import {
  column,
  countRows,
  knex,
  withDateFilter,
  withListFilter,
  WithOptionalTx,
  withRawDateFilter,
  withSkippablePagination,
  withStringFilter,
} from "@/query";
import { first } from "lodash";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { INTERVIEW_DURATION } from "@litespace/utils";

export class Interviews {
  readonly table = "interviews" as const;

  readonly columns: Record<keyof IInterview.Row, string> = {
    id: this.column("id"),
    start: this.column("start"),
    interviewer_id: this.column("interviewer_id"),
    interviewee_id: this.column("interviewee_id"),
    interviewer_feedback: this.column("interviewer_feedback"),
    interviewee_feedback: this.column("interviewee_feedback"),
    slot_id: this.column("slot_id"),
    session_id: this.column("session_id"),
    status: this.column("status"),
    created_at: this.column("created_at"),
    updated_at: this.column("updated_at"),
  };

  async create({
    tx,
    ...payload
  }: WithOptionalTx<IInterview.CreateModelPayload>): Promise<IInterview.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        start: dayjs.utc(payload.start).toDate(),
        interviewer_id: payload.interviewerId,
        interviewee_id: payload.intervieweeId,
        session_id: payload.session,
        slot_id: payload.slot,
        status: IInterview.Status.Pending,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("interview not found; should never happen");
    return this.from(row);
  }

  async update({
    id,
    tx,
    ...payload
  }: WithOptionalTx<IInterview.UpdatePayload>): Promise<IInterview.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .update({
        interviewer_feedback: payload.interviewerFeedback,
        interviewee_feedback: payload.intervieweeFeedback,
        status: payload.status,
        updated_at: now,
      })
      .where(this.column("id"), id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("interview not found; should never happen");
    return this.from(row);
  }

  async cancel({
    tx,
    ids,
    status,
  }: WithOptionalTx<{
    ids: number[];
    status:
      | IInterview.Status.CanceledByInterviewer
      | IInterview.Status.CanceledByInterviewee;
  }>) {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .update({
        status,
        updated_at: now,
      })
      .whereIn(this.column("id"), ids);
  }

  async findOne(
    query: WithOptionalTx<IInterview.FindModelQuery>
  ): Promise<IInterview.Self | null> {
    const { list } = await this.find(query);
    return first(list) || null;
  }

  /**
   * @note interviews are sorted in descending order by the creation date and
   * the their ids.
   */
  async find({
    ids,
    users,
    interviewers,
    interviewees,
    interviewerFeedback,
    intervieweeFeedback,
    slots,
    sessions,
    statuses,
    canceled,
    start,
    end,
    createdAt,
    tx,
    ...pagination
  }: WithOptionalTx<IInterview.FindModelQuery>): Promise<
    Paginated<IInterview.Self>
  > {
    const base = this.builder(tx);

    // ============== list fields ========
    withListFilter(
      base,
      [this.column("interviewer_id"), this.column("interviewee_id")],
      users
    );
    withListFilter(base, this.column("id"), ids);
    withListFilter(base, this.column("interviewer_id"), interviewers);
    withListFilter(base, this.column("interviewee_id"), interviewees);
    withListFilter(base, this.column("slot_id"), slots);
    withListFilter(base, this.column("session_id"), sessions);
    withListFilter(base, this.column("status"), statuses);

    // ============== date fields ========
    withDateFilter(base, this.column("start"), start);
    withDateFilter(base, this.column("created_at"), createdAt);
    withRawDateFilter(
      base,
      knex.raw("?? + INTERVAL '? Minutes'", [
        this.column("start"),
        INTERVIEW_DURATION,
      ]),
      end
    );

    // ============== nullable string fields ========
    withStringFilter(
      base,
      this.column("interviewer_feedback"),
      interviewerFeedback
    );
    withStringFilter(
      base,
      this.column("interviewee_feedback"),
      interviewerFeedback
    );

    // ============== custom ========
    if (canceled !== undefined) {
      const fn = canceled ? base.whereIn : base.whereNotIn;
      fn.bind(base)(this.column("status"), [
        IInterview.Status.CanceledByInterviewer,
        IInterview.Status.CanceledByInterviewee,
      ]);
    }

    const total = await countRows(base.clone());

    const queryBuilder = base
      .clone()
      .select<IInterview.Row[]>(this.columns)
      .orderBy([
        {
          column: this.column("created_at"),
          order: "desc",
        },
        {
          column: this.column("id"),
          order: "desc",
        },
      ]);

    const rows = await withSkippablePagination(queryBuilder, pagination);
    return { list: rows.map((row) => this.from(row)), total };
  }

  from(row: IInterview.Row): IInterview.Self {
    return {
      id: row.id,
      interviewerId: row.interviewer_id,
      intervieweeId: row.interviewee_id,
      slotId: row.slot_id,
      sessionId: row.session_id,
      interviewerFeedback: row.interviewer_feedback,
      intervieweeFeedback: row.interviewee_feedback,
      start: row.start.toISOString(),
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    const builder = tx || knex;
    return builder<IInterview.Row>(this.table);
  }

  column(value: keyof IInterview.Row): string {
    return column<IInterview.Row>(value, this.table);
  }
}

export const interviews = new Interviews();
