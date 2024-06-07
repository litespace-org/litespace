import { knex, query } from "@/models/query";
import { first } from "lodash";
import { ICall } from "@litespace/types";

export class Calls {
  async create(call: ICall.CreatePayload): Promise<ICall.Self> {
    const rows = await knex<ICall.Row>("calls").insert(
      {
        type: call.type,
        host_id: call.hostId,
        attendee_id: call.attendeeId,
        slot_id: call.slotId,
        zoom_meeting_id: call.zoomMeetingId,
        system_zoom_account_id: call.systemZoomAccountId,
        start: new Date(call.start),
        duration: call.duration,
        meeting_url: call.meetingUrl,
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
    const { rows } = await query<ICall.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "duration",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons"
        WHERE
                id = $1;
      `,
      [id]
    );

    const lesson = first(rows);
    if (!lesson) return null;
    return this.from(lesson);
  }

  async findByTutuorId(tutorId: number): Promise<ICall.Self[]> {
    const { rows } = await query<ICall.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "duration",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons"
        WHERE
                tutor_id = $1;
      `,
      [tutorId]
    );

    return rows.map((row) => this.from(row));
  }

  async findByStudentId(studentId: number): Promise<ICall.Self[]> {
    const { rows } = await query<ICall.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "duration",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons"
        WHERE
                student_id = $1;
      `,
      [studentId]
    );

    return rows.map((row) => this.from(row));
  }

  async findBySlotId(slotId: number): Promise<ICall.Self[]> {
    const { rows } = await query<ICall.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "duration",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons"
        WHERE
                slot_id = $1;
      `,
      [slotId]
    );

    return rows.map((row) => this.from(row));
  }

  async findAll(): Promise<ICall.Self[]> {
    const { rows } = await query<ICall.Row, []>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "duration",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons";
      `
    );

    return rows.map((row) => this.from(row));
  }

  from(row: ICall.Row): ICall.Self {
    return {
      id: row.id,
      type: row.type,
      hostId: row.host_id,
      attendeeId: row.attendee_id,
      slotId: row.slot_id,
      zoomMeetingId: row.zoom_meeting_id,
      systemZoomAccountId: row.system_zoom_account_id,
      start: row.start.toISOString(),
      duration: row.duration,
      meetingUrl: row.meeting_url,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const calls = new Calls();
