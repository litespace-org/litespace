import { IFilter, IInterview, ISession, Paginated } from "@litespace/types";
import {
  column,
  countRows,
  knex,
  WithOptionalTx,
  withPagination,
} from "@/query";
import { first, isEmpty } from "lodash";
import dayjs from "@/lib/dayjs";
import { Knex } from "knex";
import { users } from "@/users";

export class Interviews {
  readonly table = "interviews" as const;

  readonly columns: Record<keyof IInterview.Row, string> = {
    id: this.column("id"),
    start: this.column("start"),
    interviewer_id: this.column("interviewer_id"),
    interviewee_id: this.column("interviewee_id"),
    interviewer_feedback: this.column("interviewer_feedback"),
    interviewee_feedback: this.column("interviewee_feedback"),
    rule_id: this.column("rule_id"),
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
        rule_id: payload.rule,
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

  async findSessionMembers(
    sessionId: string,
    tx?: Knex.Transaction
  ): Promise<ISession.PopuldatedMember[]> {
    const select: Record<keyof ISession.PopuldatedMemberRow, string> = {
      user_id: users.column("id"),
      session_id: this.columns.session_id,
      name: users.column("name"),
      image: users.column("image"),
      role: users.column("role"),
    };

    const rows: ISession.PopuldatedMemberRow[] = await this.builder(tx)
      .select<ISession.PopuldatedMemberRow[]>(select)
      .join(
        users.table,
        users.column("id"),
        this.column("interviewer_id")
      )
      .join(
        users.table,
        users.column("id"),
        this.column("interviewee_id")
      )
      .where(this.column("session_id"), sessionId);

    return rows.map((row) => this.asSessionPopulatedMember(row));
  }

  async findByInterviewee(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("interviewee_id", id);
  }

  async findByInterviewer(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("interviewer_id", id);
  }

  async findByRuleId(id: number): Promise<IInterview.Self[]> {
    return await this.findManyBy("rule_id", id);
  }

  async find({
    statuses,
    signers,
    levels,
    signed,
    users,
    page,
    size,
    rules = [],
    cancelled,
    tx,
  }: {
    users?: number[];
    statuses?: IInterview.Status[];
    levels?: IInterview.Self["level"][];
    tx?: Knex.Transaction;
    signed?: boolean;
    signers?: number[];
    rules?: number[];
    cancelled?: boolean;
  } & IFilter.Pagination): Promise<Paginated<IInterview.Self>> {
    const baseBuilder = this.builder(tx);

    if (users && !isEmpty(users))
      baseBuilder.where((builder) => {
        builder
          .whereIn(this.column("interviewer_id"), users)
          .orWhereIn(this.column("interviewee_id"), users);
      });

    if (statuses && !isEmpty(statuses))
      baseBuilder.whereIn(this.column("status"), statuses);

    if (levels && !isEmpty(levels))
      baseBuilder.whereIn(this.column("level"), levels);

    if (signed === true)
      baseBuilder.where(this.column("signer"), "IS NOT", null);
    else if (signed === false)
      baseBuilder.where(this.column("signer"), "IS", null);

    if (signers && !isEmpty(signers))
      baseBuilder.whereIn(this.column("signer"), signers);

    if (!isEmpty(rules)) baseBuilder.whereIn(this.column("rule_id"), rules);

    if (cancelled === true)
      baseBuilder.where(this.column("canceled_at"), "IS NOT", null);
    else if (cancelled === false)
      baseBuilder.where(this.column("canceled_at"), "IS", null);

    const total = await countRows(baseBuilder.clone());

    const queryBuilder = baseBuilder
      .clone()
      .select<IInterview.Row[]>(this.columns)
      .orderBy(this.column("start"), "desc");
    const rows = await withPagination(queryBuilder, { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  from(row: IInterview.Row): IInterview.Self {
    return {
      ids: {
        self: row.id,
        interviewer: row.interviewer_id,
        interviewee: row.interviewee_id,
        rule: row.rule_id,
        session: row.session_id,
      },
      sessionId: row.session_id,
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

  asSessionPopulatedMember(
    row: ISession.PopuldatedMemberRow
  ): ISession.PopuldatedMember {
    return {
      sessionId: row.session_id,
      userId: row.user_id,
      name: row.name,
      image: row.image,
      role: row.role,
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IInterview.Row>(this.table).clone()
      : knex<IInterview.Row>(this.table).clone();
  }

  column(value: keyof IInterview.Row): string {
    return column<IInterview.Row>(value, this.table);
  }
}

export const interviews = new Interviews();
