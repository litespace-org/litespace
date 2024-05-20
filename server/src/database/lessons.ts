import { query } from "@/database/query";
import { first } from "lodash";

export class Lessons {
  async create(lesson: Omit<Lesson.Self, "id">): Promise<void> {
    await query(
      `
        INSERT INTO
            "lessons" (
                tutor_id,
                student_id,
                slot_id,
                zoom_meeting_id,
                start,
                end,
                meeting_url,
                created_at,
                updated_at
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `,
      [
        lesson.tutuorId,
        lesson.studentId,
        lesson.slotId,
        lesson.zoomMeetingId,
        lesson.start,
        lesson.end,
        lesson.meetingUrl,
        lesson.createdAt,
        lesson.updatedAt,
      ]
    );
  }
  async delete(id: number): Promise<void> {
    await query(` DELETE FROM slots WHERE id = $1;`, [id]);
  }
  async findById(id: number): Promise<Lesson.Self | null> {
    const { rows } = await query<Lesson.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "end",
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
    return this.as(lesson);
  }

  async findByTutuorId(tutorId: number): Promise<Lesson.Self[]> {
    const { rows } = await query<Lesson.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "end",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons"
        WHERE
                tutor_id = $1;
      `,
      [tutorId]
    );

    return rows.map((row) => this.as(row));
  }

  async findByStudentId(studentId: number) {
    const { rows } = await query<Lesson.Row, [number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "slot_id",
            "zoom_meeting_id",
            "start",
            "end",
            "meeting_url",
            "created_at",
            "updated_at"
        FROM "lessons"
        WHERE
                student_id = $1;
      `,
      [studentId]
    );

    return rows.map((row) => this.as(row));
  }

  as(row: Lesson.Row): Lesson.Self {
    return {
      id: row.id,
      tutuorId: row.tutor_id,
      studentId: row.student_id,
      slotId: row.slot_id,
      zoomMeetingId: row.zoom_meeting_id,
      start: row.start,
      end: row.end,
      meetingUrl: row.meeting_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export namespace Lesson {
  export type Row = {
    id: number;
    tutor_id: number;
    student_id: number;
    slot_id: number;
    zoom_meeting_id: number;
    start: string;
    end: string;
    meeting_url: string;
    created_at: string;
    updated_at: string;
  };

  export type Self = {
    id: number;
    tutuorId: number;
    studentId: number;
    slotId: number;
    zoomMeetingId: number;
    start: string;
    end: string;
    meetingUrl: string;
    createdAt: string;
    updatedAt: string;
  };
}
