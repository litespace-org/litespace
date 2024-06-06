import { first, isEmpty } from "lodash";
import { query } from "@/models/query";
import { IRating } from "@litespace/types";

export class Ratings {
  async create(rating: Omit<IRating.Self, "id">): Promise<number> {
    const { rows } = await query<
      { id: number },
      [
        tutorId: number,
        studentId: number,
        value: number,
        note: string | null,
        createdAt: string,
        updatedAt: string,
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
                note = COALESCE($2, note)
            WHERE
                id = $3;
          `,
      [value, note, id]
    );
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM "ratings" WHERE id = $1;`, [id]);
  }

  async findTutorRatings(tutorId: number): Promise<IRating.Self[]> {
    const { rows } = await query<IRating.Row, [tutorId: number]>(
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

  async findByEntities({
    tutorId,
    studentId,
  }: {
    tutorId: number;
    studentId: number;
  }): Promise<IRating.Self | null> {
    const { rows } = await query<
      IRating.Row,
      [tutorId: number, studnetId: number]
    >(
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
            tutor_id = $1 AND student_id = $2;
      `,
      [tutorId, studentId]
    );

    if (rows.length > 1)
      throw new Error(
        "Unexpected result; expected on recored; should never happen"
      );

    const row = first(rows);
    if (!row) return null;
    return this.fromRow(row);
  }

  async findById(id: number): Promise<IRating.Self | null> {
    const { rows } = await query<IRating.Row, [id: number]>(
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
            id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.fromRow(row);
  }

  async exists(id: number): Promise<boolean> {
    const { rows } = await query<{ id: number }, [id: number]>(
      `SELECT id FROM "ratings" WHERE id = $1`,
      [id]
    );
    return !isEmpty(rows);
  }

  fromRow(row: IRating.Row): IRating.Self {
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
