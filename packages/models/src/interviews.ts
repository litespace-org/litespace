import { IFilter, IInterview, ISession, Paginated } from "@litespace/types";
import {
  column,
  countRows,
  knex,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { first, isEmpty } from "lodash";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";

type Filters = {
  users?: number[];
  statuses?: IInterview.Status[];
  levels?: IInterview.Self["level"][];
  signed?: boolean;
  signers?: number[];
  /**
   * Start date time (ISO datetime format)
   *
   * All lessons after (or the same as) this date will be included.
   */
  after?: string;
  /**
   * End date time (ISO datetime format)
   *
   * All lessons before (or the same as) this date will be included.
   */
  before?: string;
  /**
   * When provided with the `before` or `after` flag, it will not
   * include lessons that are partially out the query time boundaries.
   * @default false
   */
  strict?: boolean;
  /**
   * slots ids to be included in the query result
   */
  slots?: number[];
  canceled?: boolean;
} & IFilter.SkippablePagination;

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
    note: this.column("note"),
    level: this.column("level"),
    status: this.column("status"),
    signer: this.column("signer"),
    canceled_by: this.column("canceled_by"),
    canceled_at: this.column("canceled_at"),
    created_at: this.column("created_at"),
    updated_at: this.column("updated_at"),
  };

  async create({
    tx,
    ...payload
  }: WithOptionalTx<IInterview.CreatePayload>): Promise<IInterview.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        start: dayjs.utc(payload.start).toDate(),
        interviewer_id: payload.interviewer,
        interviewee_id: payload.interviewee,
        session_id: payload.session,
        slot_id: payload.slot,
        status: IInterview.Status.Pending,
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
        level: payload.level,
        signer: payload.signer,
        status: payload.status,
        updated_at: now,
        canceled_at: payload.canceledAt
          ? dayjs.utc(payload.canceledAt).toDate()
          : undefined,
        canceled_by: payload.canceledBy,
      })
      .where("id", id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Interview not found; should never happen");
    return this.from(row);
  }

  async cancel({
    canceledBy,
    ids,
    tx,
  }: WithOptionalTx<{
    ids: number[];
    canceledBy: number;
  }>): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .update({
        canceled_by: canceledBy,
        canceled_at: now,
        updated_at: now,
      })
      .whereIn(this.column("id"), ids);
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

  async findBySessionId(id: ISession.Id): Promise<IInterview.Self | null> {
    return await this.findOneBy("session_id", id);
  }

  async findByInterviewee(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("interviewee_id", id);
  }

  async findByInterviewer(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("interviewer_id", id);
  }

  async findBySlotId(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("slot_id", id);
  }

  applySearchFilter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    {
      statuses,
      signers,
      levels,
      signed,
      users,
      slots,
      canceled,
      after,
      before,
      strict,
    }: Filters
  ): Knex.QueryBuilder<R, T> {
    if (users && !isEmpty(users))
      builder.where((builder) => {
        builder
          .whereIn(this.column("interviewer_id"), users)
          .orWhereIn(this.column("interviewee_id"), users);
      });

    if (statuses && !isEmpty(statuses))
      builder.whereIn(this.column("status"), statuses);

    if (levels && !isEmpty(levels))
      builder.whereIn(this.column("level"), levels);

    if (signed === true) builder.where(this.column("signer"), "IS NOT", null);
    else if (signed === false) builder.where(this.column("signer"), "IS", null);

    if (signers && !isEmpty(signers))
      builder.whereIn(this.column("signer"), signers);

    if (slots && !isEmpty(slots))
      builder.whereIn(this.column("slot_id"), slots);

    if (canceled === true)
      builder.where(this.column("canceled_at"), "IS NOT", null);
    else if (canceled === false)
      builder.where(this.column("canceled_at"), "IS", null);

    const start = this.column("start");
    const end = knex.raw("?? + INTERVAL '30 Minutes'", [start]);

    if (after)
      builder.where((builder) => {
        builder.where(start, ">=", dayjs.utc(after).toDate());
        if (!strict) builder.orWhere(end, ">", dayjs.utc(after).toDate());
      });

    if (before)
      builder.where((builder) => {
        builder.where(end, "<=", dayjs.utc(before).toDate());
        if (!strict) builder.orWhere(start, "<", dayjs.utc(before).toDate());
      });

    return builder;
  }

  async find({
    statuses,
    signers,
    levels,
    signed,
    users,
    slots = [],
    canceled,
    after,
    before,
    strict = false,
    tx,
    ...pagination
  }: WithOptionalTx<Filters>): Promise<Paginated<IInterview.Self>> {
    const baseBuilder = this.applySearchFilter(this.builder(tx), {
      statuses,
      signers,
      levels,
      signed,
      users,
      slots,
      canceled,
      after,
      before,
      strict,
    });

    const total = await countRows(baseBuilder.clone());

    const queryBuilder = baseBuilder
      .clone()
      .orderBy(this.column("start"), "desc");

    const rows = await withSkippablePagination(queryBuilder, pagination);

    return { list: rows.map((row) => this.from(row)), total };
  }

  async findFullInterview({
    statuses,
    signers,
    levels,
    signed,
    users,
    slots = [],
    canceled,
    after,
    before,
    strict = false,
    tx,
    ...pagination
  }: WithOptionalTx<Filters & IFilter.SkippablePagination>): Promise<
    Paginated<IInterview.FullInterview>
  > {
    const baseBuilder = this.applySearchFilter(this.fullBuilder(tx), {
      statuses,
      signers,
      levels,
      signed,
      users,
      slots,
      canceled,
      after,
      before,
      strict,
    });

    const total = await countRows(baseBuilder.clone());

    baseBuilder
      .leftJoin(
        "users as interviewer",
        "interviews.interviewer_id",
        "interviewer.id"
      )
      .leftJoin(
        "users as interviewee",
        "interviews.interviewee_id",
        "interviewee.id"
      )
      .select([
        "interviews.*",
        "interviewer.id as interviewer_id",
        "interviewer.name as interviewer_name",
        "interviewee.id as interviewee_id",
        "interviewee.name as interviewee_name",
      ]);

    const queryBuilder = baseBuilder
      .clone()
      .orderBy(this.column("start"), "desc");

    const rows = await withSkippablePagination(queryBuilder, pagination);

    return { list: rows.map((row) => this.asFullInterview(row)), total };
  }

  from(row: IInterview.Row): IInterview.Self {
    return {
      ids: {
        self: row.id,
        interviewer: row.interviewer_id,
        interviewee: row.interviewee_id,
        slot: row.slot_id,
        session: row.session_id,
      },
      feedback: {
        interviewer: row.interviewer_feedback,
        interviewee: row.interviewee_feedback,
      },
      start: row.start.toISOString(),
      note: row.note,
      level: row.level,
      status: row.status,
      signer: row.signer,
      canceledBy: row.canceled_by,
      canceledAt: row.canceled_at ? row.canceled_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asFullInterview(row: IInterview.PopulatedRow): IInterview.FullInterview {
    return {
      ids: {
        self: row.id,
        slot: row.slot_id,
        session: row.session_id,
        interviewee: row.interviewee_id,
        interviewer: row.interviewer_id,
      },
      feedback: {
        interviewer: row.interviewer_feedback,
        interviewee: row.interviewee_feedback,
      },
      interviewer: {
        id: row.interviewer_id,
        name: row.interviewer_name,
        image: row.interviewer_image,
        feedback: row.interviewer_feedback,
      },
      interviewee: {
        id: row.interviewee_id,
        name: row.interviewee_name,
        image: row.interviewee_image,
        feedback: row.interviewee_feedback,
      },
      start: row.start.toISOString(),
      note: row.note,
      level: row.level,
      status: row.status,
      signer: row.signer,
      canceledBy: row.canceled_by,
      canceledAt: row.canceled_at ? row.canceled_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IInterview.Row>(this.table).clone()
      : knex<IInterview.Row>(this.table).clone();
  }

  fullBuilder(tx?: Knex.Transaction) {
    return tx
      ? tx<IInterview.PopulatedRow>(this.table).clone()
      : knex<IInterview.PopulatedRow>(this.table).clone();
  }

  column(value: keyof IInterview.Row): string {
    return column<IInterview.Row>(value, this.table);
  }
}

export const interviews = new Interviews();
