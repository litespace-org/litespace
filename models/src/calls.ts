import { aggArrayOrder, column, knex } from "@/query";
import { concat, first, merge, now, omit, sortBy } from "lodash";
import { ICall } from "@litespace/types";
import { Knex } from "knex";
import { users } from "@/users";
import dayjs from "@/lib/dayjs";

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
      rule_id: this.columns.calls("rule_id"),
      start: this.columns.calls("start"),
      duration: this.columns.calls("duration"),
      canceled_by: this.columns.calls("canceled_by"),
      canceled_at: this.columns.calls("canceled_at"),
      recording_status: this.columns.calls("recording_status"),
      processing_time: this.columns.calls("processing_time"),
      created_at: this.columns.calls("created_at"),
      updated_at: this.columns.calls("updated_at"),
    },
  } as const;

  async create(
    payload: ICall.CreatePayload,
    tx: Knex.Transaction
  ): Promise<{ call: ICall.Self; members: ICall.Member[] }> {
    const now = dayjs.utc().toDate();
    const builder = this.builder(tx);
    const calls = await builder.calls
      .insert({
        rule_id: payload.ruleId,
        start: dayjs.utc(payload.start).toDate(),
        duration: payload.duration,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const call = first(calls.map((call) => this.from(call)));
    if (!call) throw new Error("Call not found; should never happen");

    const members = await builder.members
      .insert(
        concat(payload.memberIds, payload.hostId).map((userId) => ({
          host: userId === payload.hostId,
          user_id: userId,
          call_id: call.id,
          created_at: now,
          updated_at: now,
        }))
      )
      .returning("*");

    return { call, members: members.map((member) => this.asMember(member)) };
  }

  async cancel(
    id: number,
    canceledBy: number,
    tx: Knex.Transaction
  ): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .calls.update({ canceled_by: canceledBy, canceled_at: now })
      .where("id", id);
  }

  async update(
    ids: number[],
    payload: ICall.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .calls.update({
        recording_status: payload.recordingStatus,
        processing_time: payload.processingTime,
        canceled_by: payload.canceledBy,
        canceled_at: payload.canceledBy ? now : undefined,
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
    const rows = await this.builder(tx).calls.select("*").where("id", id);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findCallMembers(
    callIds: number[],
    tx?: Knex.Transaction
  ): Promise<ICall.PopuldatedMember[]> {
    const fields: Record<keyof ICall.PopuldatedMemberRow, string> = {
      userId: users.column("id"),
      callId: this.columns.members("call_id"),
      host: this.columns.members("host"),
      email: users.column("email"),
      arabicName: users.column("name_ar"),
      englishName: users.column("name_en"),
      photo: users.column("photo"),
      role: users.column("role"),
      note: this.columns.members("note"),
      feedback: this.columns.members("feedback"),
      rate: this.columns.members("rate"),
      createdAt: this.columns.members("created_at"),
      updatedAt: this.columns.members("updated_at"),
    };

    const rows = await users
      .builder(tx)
      .select<ICall.PopuldatedMemberRow[]>(fields)
      .join(
        this.tables.members,
        this.columns.members("user_id"),
        users.column("id")
      )
      .whereIn(this.columns.members("call_id"), callIds);

    return rows.map((row) => this.asPopulatedMember(row));
  }

  async findCallByMembers(members: number[], tx?: Knex.Transaction) {
    // todo: add other call attrs
    const rows = await this.builder(tx)
      .members.select("call_id")
      .groupBy("call_id")
      .havingRaw(aggArrayOrder(this.columns.members("user_id")), [
        sortBy(members),
      ]);

    const row = first(rows);
    if (!row) return null;
    return row.call_id;
  }

  async findMemberCalls({
    ignoreCanceled,
    userIds,
    between,
    tx,
  }: {
    userIds: number[];
    between?: { start: string; end: string };
    ignoreCanceled?: boolean;
    tx?: Knex.Transaction;
  }): Promise<ICall.Self[]> {
    const builder = users //? do we really need the "users" table? we can join "call_members" and "calls" directly!
      .builder(tx)
      .select<ICall.Row[]>(this.rows.calls)
      .join(
        this.tables.members,
        this.columns.members("user_id"),
        users.column("id")
      )
      .join(
        this.tables.calls,
        this.columns.calls("id"),
        this.columns.members("call_id")
      )
      .whereIn(users.column("id"), userIds);

    if (between) {
      builder.andWhereBetween(this.columns.calls("start"), [
        between.start,
        between.end,
      ]);
    }

    if (ignoreCanceled)
      builder.andWhere(this.columns.calls("canceled_by"), "!=", null);

    const rows = await builder.then();
    return rows.map((row) => this.from(row));
  }

  async findByRuleId(
    ruleId: number,
    tx?: Knex.Transaction
  ): Promise<ICall.Self[]> {
    const rows = await this.builder(tx)
      .calls.select("*")
      .where("rule_id", ruleId);

    return rows.map((row) => this.from(row));
  }

  from(row: ICall.Row): ICall.Self {
    return {
      id: row.id,
      ruleId: row.rule_id,
      start: row.start.toISOString(),
      duration: row.duration,
      canceledBy: row.canceled_by,
      canceledAt: row.canceled_at ? row.canceled_at.toISOString() : null,
      recordingStatus: row.recording_status,
      processingTime: row.processing_time,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asMember(row: ICall.MemberRow): ICall.Member {
    return {
      userId: row.user_id,
      callId: row.call_id,
      host: row.host,
      note: row.note,
      feedback: row.feedback,
      rate: row.rate,
      createAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asPopulatedMember(row: ICall.PopuldatedMemberRow): ICall.PopuldatedMember {
    return merge(
      omit(row, "arabicName", "englishName", "createdAt", "updatedAt"),
      {
        name: { ar: row.arabicName, en: row.englishName },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }
    );
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
