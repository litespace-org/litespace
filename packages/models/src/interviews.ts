import { IInterview, Paginated } from "@litespace/types";
import {
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
import { INTERVIEW_DURATION } from "@litespace/utils";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  intervieweeFeedback: "interviewee_feedback",
  intervieweeId: "interviewee_id",
  interviewerFeedback: "interviewer_feedback",
  interviewerId: "interviewer_id",
  sessionId: "session_id",
  slotId: "slot_id",
  start: "start",
  status: "status",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IInterview.Field, IInterview.Column>;

export class Interviews extends Model<
  IInterview.Row,
  IInterview.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "interviews",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

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
    select,
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
      .select(this.select(select))
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
}

export const interviews = new Interviews();
