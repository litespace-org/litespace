import { query } from "@/models/query";
import { first } from "lodash";
import { IUser } from "@litespace/types";

export class Rooms {
  async create({
    tutorId,
    studentId,
  }: {
    tutorId: number;
    studentId: number;
  }): Promise<number> {
    const { rows } = await query<
      { id: number },
      [tutorId: number, studentId: number]
    >(
      `
        INSERT INTO
            "rooms" (
                "tutor_id",
                "student_id",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, NOW(), NOW()) RETURNING id;
      `,
      [tutorId, studentId]
    );

    const row = first(rows);
    if (!row) throw new Error("Room not found; should never happen");
    return row.id;
  }

  async findById(id: number): Promise<Room.Self | null> {
    const { rows } = await query<Room.Row, [id: number]>(
      `
      SELECT
          "id",
          "tutor_id",
          "student_id",
          "created_at",
          "updated_at"
      FROM "rooms"
      WHERE id = $1
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByMembers({
    tutorId,
    studentId,
  }: {
    tutorId: number;
    studentId: number;
  }): Promise<Room.Self | null> {
    const { rows } = await query<
      Room.Row,
      [tutorId: number, studentId: number]
    >(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "created_at",
            "updated_at"
        FROM "rooms"
        WHERE
            "tutor_id" = $1
            AND "student_id" = $2;
      `,
      [tutorId, studentId]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findMemberRooms({
    userId,
    type,
  }: {
    userId: number;
    type: IUser.Type;
  }): Promise<Room.Self[]> {
    const tutorId = type === IUser.Type.Tutor ? userId : 0;
    const studentId = type === IUser.Type.Student ? userId : 0;

    const { rows } = await query<
      Room.Row,
      [tutorId: number, studentId: number]
    >(
      `
      SELECT
          "id",
          "tutor_id",
          "student_id",
          "created_at",
          "updated_at"
      FROM "rooms"
      WHERE
          CASE
              WHEN $1 != 0 THEN "tutor_id" = $1
              ELSE "student_id" = $2 
          END;
      `,
      [tutorId, studentId]
    );

    return rows.map((row) => this.from(row));
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM "rooms" WHERE id = $1;`, [id]);
  }

  from(row: Room.Row): Room.Self {
    return {
      id: row.id,
      tutorId: row.tutor_id,
      studentId: row.student_id,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.created_at.toISOString(),
    };
  }
}

export namespace Room {
  export type Self = {
    id: number;
    tutorId: number;
    studentId: number;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    tutor_id: number;
    student_id: number;
    created_at: Date;
    updated_at: Date;
  };
}
