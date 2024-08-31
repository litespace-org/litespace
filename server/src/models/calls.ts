import { aggArrayOrder, column, knex } from "@/models/query";
import { concat, first, merge, omit, sortBy } from "lodash";
import { ICall } from "@litespace/types";
import { Knex } from "knex";
import { users } from "@/models/users";
import dayjs from "@/lib/dayjs";

export class Calls {
  tables = { calls: "calls", members: "call_members" } as const;
  columns = {
    calls: (value: keyof ICall.Row) => column(value, this.tables.calls),
    members: (value: keyof ICall.MemberRow) =>
      column(value, this.tables.members),
  };

  async create(
    payload: ICall.CreatePayload,
    tx?: Knex.Transaction
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

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ICall.Self | null> {
    const rows = await this.builder(tx).calls.select("*").where("id", id);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByHostId(
    id: number,
    options: { start?: string; end?: string } = {}
  ): Promise<ICall.Self[]> {
    const query = knex<ICall.Row>("calls").select().where("host_id", id);

    if (options.start) query.andWhere("start", ">=", options.start);
    if (options.end) query.andWhere("start", "<=", options.end);

    const rows = await query.then();
    return rows.map((row) => this.from(row));
  }

  async findByAttendeeId(id: number): Promise<ICall.Self[]> {
    const rows = await knex<ICall.Row>("calls")
      .select()
      .where("attendee_id", id);
    return rows.map((row) => this.from(row));
  }

  async findByRuleId(id: number, tx?: Knex.Transaction): Promise<ICall.Self[]> {
    const rows = await this.builder(tx).calls.select("*").where("rule_id", id);
    return rows.map((row) => this.from(row));
  }

  async findCallMembers(
    callIds: number[],
    tx?: Knex.Transaction
  ): Promise<ICall.PopuldatedMember[]> {
    const fields: Record<keyof ICall.PopuldatedMemberRow, string> = {
      userId: users.column("id"),
      callId: this.columns.members("call_id"),
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
    userIds,
    between,
    tx,
  }: {
    userIds: number[];
    between?: { start: string; end: string };
    tx?: Knex.Transaction;
  }): Promise<ICall.Self[]> {
    const fields: Record<keyof ICall.Row, string> = {
      id: this.columns.calls("id"),
      rule_id: this.columns.calls("rule_id"),
      start: this.columns.calls("start"),
      duration: this.columns.calls("duration"),
      canceled_by: this.columns.calls("canceled_by"),
      created_at: this.columns.calls("created_at"),
      updated_at: this.columns.calls("updated_at"),
    };

    const builder = users
      .builder(tx)
      .select<ICall.Row[]>(fields)
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

    const rows = await builder.then();
    return rows.map((row) => this.from(row));
  }

  // async findHostCalls(id: number): Promise<ICall.HostCall[]> {
  //   return await this.getSelectHostCallQuery().where("calls.host_id", id);
  // }

  // async findHostCallById(id: number): Promise<ICall.HostCall | null> {
  //   const rows = await this.getSelectHostCallQuery().where("calls.id", id);
  //   return first(rows) || null;
  // }

  // async findTutorInterviews(tutorId: number): Promise<ICall.AttendeeCall[]> {
  //   const rows = await this.getSelectAttendeeCallQuery()
  //     .where("attendee_id", tutorId)
  //     .andWhere("type", ICall.Type.Interview);

  //   return rows.map((row) => this.asAttendeeCall(row));
  // }

  // async findHostsCallsByRange({
  //   userIds,
  //   start,
  //   end,
  //   tx,
  // }: {
  //   userIds: number[];
  //   start: string;
  //   end: string;
  //   tx?: Knex.Transaction;
  // }) {
  //   const rows = await this.builder(tx)
  //     .select("*")
  //     .whereIn("host_id", userIds)
  //     .andWhereBetween("start", [start, end]);

  //   return rows.map((row) => this.from(row));
  // }

  // getSelectHostCallQuery() {
  //   return knex
  //     .select<ICall.HostCall[]>({
  //       id: this.column("id"),
  //       hostId: this.column("host_id"),
  //       attendeeId: this.column("attendee_id"),
  //       attendeeEmail: users.column("email"),
  //       attendeeNameAr: users.column("name_ar"),
  //       attendeeNameEn: users.column("name_en"),
  //       ruleId: this.column("rule_id"),
  //       start: this.column("start"),
  //       duration: this.column("duration"),
  //       note: this.column("note"),
  //       feedback: this.column("feedback"),
  //       createdAt: this.column("created_at"),
  //       updatedAt: this.column("updated_at"),
  //     })
  //     .from<ICall.Row>("calls")
  //     .innerJoin<IUser.Row>("users", "users.id", "calls.attendee_id")
  //     .clone();
  // }

  // getSelectAttendeeCallQuery() {
  //   return knex
  //     .select<ICall.AttendeeCallRow[]>({
  //       id: this.column("id"),
  //       attendeeId: this.column("attendee_id"),
  //       hostId: this.column("host_id"),
  //       hostEmail: users.column("email"),
  //       hostNameAr: users.column("name_ar"),
  //       hostNameEn: users.column("name_en"),
  //       ruleId: this.column("rule_id"),
  //       start: this.column("start"),
  //       duration: this.column("duration"),
  //       type: this.column("type"),
  //       note: this.column("note"),
  //       feedback: this.column("feedback"),
  //       createdAt: this.column("created_at"),
  //       updatedAt: this.column("updated_at"),
  //     })
  //     .from<ICall.Row>("calls")
  //     .innerJoin("users", "users.id", "calls.host_id")
  //     .clone();
  // }

  from(row: ICall.Row): ICall.Self {
    return {
      id: row.id,
      ruleId: row.rule_id,
      start: row.start.toISOString(),
      duration: row.duration,
      canceledBy: row.canceled_by,
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

  // asAttendeeCall(row: ICall.AttendeeCallRow): ICall.AttendeeCall {
  //   return merge(omit(row, "hostEmail", "hostNameAr", "hostNameEn"), {
  //     host: {
  //       email: row.hostEmail,
  //       name: { ar: row.hostNameAr, en: row.hostNameEn },
  //     },
  //   });
  // }

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
