import {
  addSqlMinutes,
  aggArrayOrder,
  column,
  countRows,
  knex,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { first, isEmpty, sortBy } from "lodash";
import { ICall, IFilter, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { users } from "@/users";
import dayjs from "@/lib/dayjs";
import { lessons } from "@/lessons";
import { interviews } from "@/interviews";

export class Calls {
  tables = { calls: "calls", members: "call_members" } as const;
  columns = {
    calls: (value: keyof ICall.Row) => column(value, this.tables.calls),
    members: (value: keyof ICall.MemberRow) =>
      column(value, this.tables.members),
  };

  rows: { calls: Record<keyof ICall.Row, string> } = {
    calls: {
      id: this.columns.calls("id"),
      recording_status: this.columns.calls("recording_status"),
      processing_time: this.columns.calls("processing_time"),
      created_at: this.columns.calls("created_at"),
      updated_at: this.columns.calls("updated_at"),
    },
  } as const;

  async create(tx?: Knex.Transaction): Promise<ICall.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .calls.insert({ created_at: now, updated_at: now })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Call not found; should never happen");
    return this.from(row);
  }

  async addMember({
    callId,
    userId,
    tx,
  }: WithOptionalTx<{
    callId: number;
    userId: number;
  }>): Promise<ICall.Member> {
    const rows = await this.builder(tx)
      .members.insert({
        call_id: callId,
        user_id: userId,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Call member not found; should never happen");
    return this.asMember(row);
  }

  async removeMember({
    callId,
    userId,
    tx,
  }: WithOptionalTx<{ userId: number; callId: number }>): Promise<void> {
    await this.builder(tx)
      .members.where(this.columns.members("call_id"), callId)
      .andWhere(this.columns.members("user_id"), userId)
      .delete();
  }

  async update({
    ids,
    payload,
    tx,
  }: {
    ids: number[];
    payload: ICall.UpdatePayload;
    tx?: Knex.Transaction;
  }): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .calls.update({
        recording_status: payload.recordingStatus,
        processing_time: payload.processingTime,
        updated_at: now,
      })
      .whereIn(this.columns.calls("id"), ids);
  }

  async findCallsByRecordingStatus(
    status: ICall.RecordingStatus,
    tx?: Knex.Transaction
  ): Promise<ICall.Self[]> {
    const rows = await this.builder(tx)
      .calls.select(this.rows.calls)
      .where(this.columns.calls("recording_status"), status);
    return rows.map((row) => this.from(row));
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ICall.Self | null> {
    const rows = await this.builder(tx)
      .calls.select("*")
      .where(this.columns.calls("id"), id);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByIds(ids: number[], tx?: Knex.Transaction): Promise<ICall.Self[]> {
    const rows = await this.builder(tx)
      .calls.select("*")
      .whereIn(this.columns.calls("id"), ids);
    return rows.map((row) => this.from(row));
  }

  async findCallMembers(
    callIds: number[],
    tx?: Knex.Transaction
  ): Promise<ICall.PopuldatedMember[]> {
    const selectRow: Record<keyof ICall.PopuldatedMemberRow, string> = {
      call_id: this.columns.members("call_id"),
      user_id: users.column("id"),
      name: users.column("name"),
      image: users.column("image"),
      role: users.column("role"),
    };

    const rows = await users
      .builder(tx)
      .select<ICall.PopuldatedMemberRow[]>(selectRow)
      .join(
        this.tables.members,
        this.columns.members("user_id"),
        users.column("id")
      )
      .whereIn(this.columns.members("call_id"), callIds);

    return rows.map((row) => this.asPopulatedMember(row));
  }

  /**
   * @param users list of user ids
   * @param after ISO UTC datetime - All calls after this date will be included (inclusive)
   * @param before ISO UTC datetime - All calls before this date will be included (inclusive)
   */
  async find({
    users = [],
    after,
    before,
    tx,
    ...pagination
  }: IFilter.SkippablePagination &
    WithOptionalTx<{
      users?: number[];
      after?: string;
      before?: string;
    }>): Promise<Paginated<ICall.Self>> {
    const selectColumns: Record<keyof ICall.Row, string> = {
      id: this.columns.calls("id"),
      recording_status: this.columns.calls("recording_status"),
      processing_time: this.columns.calls("processing_time"),
      created_at: this.columns.calls("created_at"),
      updated_at: this.columns.calls("updated_at"),
    };

    const baseBuilder = this.builder(tx)
      .calls.select<ICall.Row[]>(selectColumns)
      .fullOuterJoin(
        lessons.table.lessons,
        lessons.columns.lessons("call_id"),
        calls.columns.calls("id")
      )
      .fullOuterJoin(
        lessons.table.members,
        lessons.columns.members("lesson_id"),
        lessons.columns.lessons("id")
      )
      .fullOuterJoin(
        interviews.table,
        interviews.column("call_id"),
        calls.columns.calls("id")
      )
      .groupBy(this.columns.calls("id"));

    if (!isEmpty(users))
      baseBuilder.where((builder) => {
        builder
          .whereIn(lessons.columns.members("user_id"), users)
          .orWhereIn(interviews.column("interviewer_id"), users)
          .orWhereIn(interviews.column("interviewee_id"), users);
      });

    if (after)
      baseBuilder.where((builder) => {
        builder
          .andWhere(
            addSqlMinutes(
              lessons.columns.lessons("start"),
              lessons.columns.lessons("duration")
            ),
            ">=",
            dayjs.utc(after).toDate()
          )
          .orWhere(
            interviews.column("start"),
            ">=",
            // todo: unmatic this number (30 minutes)
            dayjs.utc(after).subtract(30, "minutes").toDate()
          );
      });

    if (before)
      baseBuilder.where((builder) => {
        builder
          .andWhere(
            addSqlMinutes(
              lessons.columns.lessons("start"),
              lessons.columns.lessons("duration")
            ),
            "<=",
            dayjs.utc(before).toDate()
          )
          .orWhere(
            interviews.column("start"),
            "<=",
            // todo: unmatic this number (30 minutes)
            dayjs.utc(before).subtract(30, "minutes")
          );
      });

    const total = await countRows(baseBuilder.clone(), {
      column: this.columns.calls("id"),
    });

    const rows = await withSkippablePagination(baseBuilder.clone(), pagination);

    return { list: rows.map((row) => this.from(row)), total };
  }

  /**
   * @deprecated should be removed because of the new data models.
   */
  async findCallByMembers(members: number[], tx?: Knex.Transaction) {
    // todo: add other call attrs
    const rows: Pick<ICall.MemberRow, "call_id">[] = await this.builder(tx)
      .members.select("call_id")
      .groupBy("call_id")
      .havingRaw(aggArrayOrder(this.columns.members("user_id")), [
        sortBy(members),
      ]);

    const row = first(rows);
    if (!row) return null;
    return row.call_id;
  }

  from(row: ICall.Row): ICall.Self {
    return {
      id: row.id,
      recordingStatus: row.recording_status,
      processingTime: row.processing_time,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asMember(row: ICall.MemberRow): ICall.Member {
    return { userId: row.user_id, callId: row.call_id };
  }

  asPopulatedMember(row: ICall.PopuldatedMemberRow): ICall.PopuldatedMember {
    return {
      callId: row.call_id,
      userId: row.user_id,
      name: row.name,
      image: row.image,
      role: row.role,
    };
  }

  builder(tx?: Knex.Transaction) {
    return {
      calls: tx
        ? tx<ICall.Row>(this.tables.calls).clone()
        : knex<ICall.Row>(this.tables.calls).clone(),
      members: tx
        ? tx<ICall.MemberRow>(this.tables.members).clone()
        : knex<ICall.MemberRow>(this.tables.members).clone(),
    };
  }
}

export const calls = new Calls();
