import { knex, query } from "@/models/query";
import { first } from "lodash";
import { ICall, IUser } from "@litespace/types";

export class Calls {
  async create(call: ICall.CreatePayload): Promise<ICall.Self> {
    const rows = await knex<ICall.Row>("calls").insert(
      {
        type: call.type,
        host_id: call.hostId,
        attendee_id: call.attendeeId,
        slot_id: call.slotId,
        start: new Date(call.start),
        duration: call.duration,
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

  async findByHostId(id: number): Promise<ICall.Self[]> {
    const rows = await knex<ICall.Row>("calls").select().where("host_id", id);
    return rows.map((row) => this.from(row));
  }

  async findByAttendeeId(id: number): Promise<ICall.Self[]> {
    const rows = await knex<ICall.Row>("calls")
      .select()
      .where("attendee_id", id);
    return rows.map((row) => this.from(row));
  }

  async findBySlotId(id: number): Promise<ICall.Self[]> {
    const rows = await knex<ICall.Row>("calls").select().where("slot_id", id);
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

  getSelectHostCallQuery() {
    return knex
      .select<ICall.HostCall[]>({
        id: "calls.id",
        hostId: "calls.host_id",
        attendeeId: "calls.attendee_id",
        attendeeEmail: "users.email",
        attendeeName: "users.name",
        slotId: "calls.slot_id",
        start: "calls.start",
        duration: "calls.duration",
        note: "calls.note",
        feedback: "calls.feedback",
        createdAt: "calls.created_at",
        updatedAt: "calls.updated_at",
      })
      .from<ICall.Row>("calls")
      .innerJoin<IUser.Row>("users", "users.id", "calls.attendee_id")
      .clone();
  }

  from(row: ICall.Row): ICall.Self {
    return {
      id: row.id,
      type: row.type,
      hostId: row.host_id,
      attendeeId: row.attendee_id,
      slotId: row.slot_id,
      start: row.start.toISOString(),
      duration: row.duration,
      note: row.note,
      feedback: row.feedback,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const calls = new Calls();
