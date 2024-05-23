import { first } from "lodash";
import { query } from "./query";

export class Ratings {
  async create(rating: Omit<Rating.Self, "id">): Promise<number> {
    const { rows } = await query<
      { id: number },
      [
        tutorId: number,
        studentId: number,
        value: number,
        note: string | null,
        createdAt: string,
        updatedAt: string
      ]
    >(
      `
        INSERT INTO
            "ratings" (
                "tutor_id",
                "student_id",
                "value",
                "note",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
     `,
      [
        rating.tutorId,
        rating.studentId,
        rating.value,
        rating.note,
        rating.createdAt,
        rating.updatedAt,
      ]
    );

    const row = first(rows);
    if (!row) throw new Error("Rating not found, should never happen");
    return row.id;
  }

  async update({
    id,
    value,
    note,
  }: {
    id: number;
    value?: number;
    note?: string;
  }): Promise<void> {
    await query(
      `
            UPDATE "ratings"
            SET
                value = COALESCE($1, value),
                note = COALESCE($2, note),
            WHERE
                id = $3;
          `,
      [value, note, id]
    );
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM "ratings" WHERE id = $1;`, [id]);
  }

  async getTutorRatings(tutorId: number): Promise<Rating.Self[]> {
    const { rows } = await query<Rating.Row, [tutorId: number]>(
      `
        SELECT
            "id",
            "tutor_id",
            "student_id",
            "value",
            "note",
            "created_at",
            "updated_at"
        FROM ratings
        WHERE
            tutor_id = $1;
            `,
      [tutorId]
    );

    return rows.map((row) => this.fromRow(row));
  }

  fromRow(row: Rating.Row): Rating.Self {
    return {
      id: row.id,
      tutorId: row.tutor_id,
      studentId: row.student_id,
      value: row.value,
      note: row.note,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export namespace Rating {
  export type Self = {
    id: number;
    tutorId: number;
    studentId: number;
    value: number;
    note: string | null;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    tutor_id: number;
    student_id: number;
    value: number;
    note: string | null;
    created_at: Date;
    updated_at: Date;
  };
}
