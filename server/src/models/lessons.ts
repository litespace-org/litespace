import { query } from "@/models/query";
import { first } from "lodash";
import { ILesson } from "@litespace/types";

export class Lessons {
  async create(lesson: Omit<ILesson.Self, "id">): Promise<number> {
    const { rows } = await query<
      { id: number },
      [
        tutorId: number,
        studentId: number,
        slotId: number,
        zoomMeetingId: number,
        start: string,
        duration: number,
        meatingUrl: string,
        createdAt: string,
        updatedAt: string,
      ]
    >(
      `
        INSERT INTO
            "lessons" (
                tutor_id,
                student_id,
                slot_id,
                zoom_meeting_id,
                start,
                duration,
                meeting_url,
                created_at,
                updated_at
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;
      `,
      [
        lesson.tutorId,
        lesson.studentId,
        lesson.slotId,
        lesson.zoomMeetingId,
        lesson.start,
        lesson.duration,
        lesson.meetingUrl,
        lesson.createdAt,
        lesson.updatedAt,
      ]
    );

    const row = first(rows);
    if (!row) throw new Error("Lesson not found, should never happen");
    return row.id;
  }

  async delete(id: number): Promise<void> {
    await query(` DELETE FROM lessons WHERE id = $1;`, [id]);
  }

  async findById(id: number): Promise<ILesson.Self | null> {
    const { rows } = await query<ILesson.Row, [number]>(
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
    return this.as(lesson);
  }

  async findByTutuorId(tutorId: number): Promise<ILesson.Self[]> {
    const { rows } = await query<ILesson.Row, [number]>(
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

    return rows.map((row) => this.as(row));
  }

  async findByStudentId(studentId: number): Promise<ILesson.Self[]> {
    const { rows } = await query<ILesson.Row, [number]>(
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

    return rows.map((row) => this.as(row));
  }

  async findBySlotId(slotId: number): Promise<ILesson.Self[]> {
    const { rows } = await query<ILesson.Row, [number]>(
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

    return rows.map((row) => this.as(row));
  }

  async findAll(): Promise<ILesson.Self[]> {
    const { rows } = await query<ILesson.Row, []>(
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

    return rows.map((row) => this.as(row));
  }

  as(row: ILesson.Row): ILesson.Self {
    return {
      id: row.id,
      tutorId: row.tutor_id,
      studentId: row.student_id,
      slotId: row.slot_id,
      zoomMeetingId: row.zoom_meeting_id,
      start: row.start.toISOString(),
      duration: row.duration,
      meetingUrl: row.meeting_url,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
