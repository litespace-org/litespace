import { query } from "@/database/query";
import { DeepPartial } from "@/types/utils";
import { first } from "lodash";

export class Tutors {
  async create(tutor: Tutor.Self): Promise<void> {
    await query(
      `
        INSERT INTO
            tutors (id, bio, about, video, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6);
      `,
      [
        tutor.id,
        tutor.bio,
        tutor.about,
        tutor.video,
        tutor.createdAt,
        tutor.updatedAt,
      ]
    );
  }

  async update(
    tutor: DeepPartial<Omit<Tutor.Self, "createdAt">> & { id: number }
  ) {
    await query(
      `
        UPDATE tutors
        SET
            bio = COALESCE($1, bio),
            about = COALESCE($2, about),
            video = COALESCE($3, video),
            updated_at = COALESCE($4, updated_at),
        where
            id = $5;
        `,
      [tutor.bio, tutor.about, tutor.video, tutor.updatedAt, tutor.id]
    );
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM tutors WHERE id = $1;`, [id]);
  }

  async findById(id: number): Promise<Tutor.Self | null> {
    const { rows } = await query<Tutor.Self, [number]>(
      `
        SELECT
            id,
            bio
            about
            video
            created_at,
            updated_at
        FROM tutors
        WHERE
            id = $1;
            
     `,
      [id]
    );

    return first(rows) || null;
  }

  async findMany(ids: number[]) {
    const { rows } = await query<Tutor.Self, [number[]]>(
      `
        SELECT
            id,
            bio
            about
            video
            created_at,
            updated_at
        FROM tutors
        WHERE
            id in $1;
     `,
      [ids]
    );

    return rows;
  }
}

export namespace Tutor {
  export type Self = {
    id: number;
    bio: string | null;
    about: string | null;
    video: string | null;
    createdAt: string;
    updatedAt: string;
  };
}
