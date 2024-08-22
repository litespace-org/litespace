import { column, knex, query } from "@/models/query";
import { first, merge, omit } from "lodash";
import { ICall, IUser } from "@litespace/types";
import { Knex } from "knex";
import { users } from "./users";

export class Calls {
  table = "calls";

  async create(
    call: ICall.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<ICall.Self> {
    const now = new Date();
    const rows = await this.builder(tx).insert(
      {
        type: call.type,
        host_id: call.hostId,
        attendee_id: call.attendeeId,
        rule_id: call.ruleId,
        start: new Date(call.start),
        duration: call.duration,
        created_at: now,
        updated_at: now,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("Lesson not found, should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await query(` DELETE FROM lessons WHERE id = $1;`, [id]);
  }

  async findById(id: number): Promise<ICall.Self | null> {
    const rows = await knex<ICall.Row>("calls").select().where("id", id);
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

  async findByRuleId(id: number): Promise<ICall.Self[]> {
    const rows = await knex<ICall.Row>("calls").select().where("rule_id", id);
    return rows.map((row) => this.from(row));
  }

  async findAll(): Promise<ICall.Self[]> {
    const rows = await knex<ICall.Row>("calls").select();
    return rows.map((row) => this.from(row));
  }

  async findHostCalls(id: number): Promise<ICall.HostCall[]> {
    return await this.getSelectHostCallQuery().where("calls.host_id", id);
  }

  async findHostCallById(id: number): Promise<ICall.HostCall | null> {
    const rows = await this.getSelectHostCallQuery().where("calls.id", id);
    return first(rows) || null;
  }

  async findTutorInterviews(tutorId: number): Promise<ICall.AttendeeCall[]> {
    const rows = await this.getSelectAttendeeCallQuery()
      .where("attendee_id", tutorId)
      .andWhere("type", ICall.Type.Interview);

    return rows.map((row) => this.asAttendeeCall(row));
  }

  getSelectHostCallQuery() {
    return knex
      .select<ICall.HostCall[]>({
        id: this.column("id"),
        hostId: this.column("host_id"),
        attendeeId: this.column("attendee_id"),
        attendeeEmail: users.column("email"),
        attendeeNameAr: users.column("name_ar"),
        attendeeNameEn: users.column("name_en"),
        ruleId: this.column("rule_id"),
        start: this.column("start"),
        duration: this.column("duration"),
        note: this.column("note"),
        feedback: this.column("feedback"),
        createdAt: this.column("created_at"),
        updatedAt: this.column("updated_at"),
      })
      .from<ICall.Row>("calls")
      .innerJoin<IUser.Row>("users", "users.id", "calls.attendee_id")
      .clone();
  }

  getSelectAttendeeCallQuery() {
    return knex
      .select<ICall.AttendeeCallRow[]>({
        id: this.column("id"),
        attendeeId: this.column("attendee_id"),
        hostId: this.column("host_id"),
        hostEmail: users.column("email"),
        hostNameAr: users.column("name_ar"),
        hostNameEn: users.column("name_en"),
        ruleId: this.column("rule_id"),
        start: this.column("start"),
        duration: this.column("duration"),
        type: this.column("type"),
        note: this.column("note"),
        feedback: this.column("feedback"),
        createdAt: this.column("created_at"),
        updatedAt: this.column("updated_at"),
      })
      .from<ICall.Row>("calls")
      .innerJoin("users", "users.id", "calls.host_id")
      .clone();
  }

  from(row: ICall.Row): ICall.Self {
    return {
      id: row.id,
      type: row.type,
      hostId: row.host_id,
      attendeeId: row.attendee_id,
      ruleId: row.rule_id,
      start: row.start.toISOString(),
      duration: row.duration,
      note: row.note,
      feedback: row.feedback,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asAttendeeCall(row: ICall.AttendeeCallRow): ICall.AttendeeCall {
    return merge(omit(row, "hostEmail", "hostNameAr", "hostNameEn"), {
      host: {
        email: row.hostEmail,
        name: { ar: row.hostNameAr, en: row.hostNameEn },
      },
    });
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<ICall.Row>(this.table).clone()
      : knex<ICall.Row>(this.table).clone();
  }

  column(value: keyof ICall.Row) {
    return column(value, this.table);
  }
}

export const calls = new Calls();
