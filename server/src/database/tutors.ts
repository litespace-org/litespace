import { query } from "@/database/query";
import { DeepPartial } from "@/types/utils";
import { first } from "lodash";

export class Tutors {
  async create(
    tutor: Omit<Tutor.Self, "zoomRefreshToken" | "authorizedZoomApp">
  ): Promise<void> {
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
  ): Promise<void> {
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

  async findById(id: number): Promise<Tutor.Shareable | null> {
    const { rows } = await query<Tutor.Shareable, [number]>(
      `
        SELECT
            id,
            bio,
            about,
            video,
            authorized_zoom_app,
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

  async findTutorZoomRefreshToken(id: number): Promise<string | null> {
    const { rows } = await query<{ token: string | null }, [id: number]>(
      `SELECT zoom_refresh_token as token FROM tutors WHERE id = $1;`,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return row.token;
  }

  async setTutorZoomRefreshToken(
    id: number,
    token: string,
    date: string
  ): Promise<void> {
    await query<{}, [token: string, date: string, id: number]>(
      `
      UPDATE tutors
      SET
          zoom_refresh_token = $1,
          aquired_refresh_token_at = $2 
      WHERE
          id = $3;
    `,
      [token, date, id]
    );
  }

  async markTutorWithAuthorizedZoomApp(
    id: number,
    token: string,
    date: string
  ) {
    await query<{}, [token: string, date: string, id: number]>(
      `
      UPDATE tutors
      SET
          authorized_zoom_app = true,
          zoom_refresh_token = $1,
          aquired_refresh_token_at = $2 
      WHERE
          id = $3;
    `,
      [token, date, id]
    );
  }
}

export namespace Tutor {
  export type Self = {
    id: number;
    bio: string | null;
    about: string | null;
    video: string | null;
    zoomRefreshToken: string | null;
    authorizedZoomApp: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    bio: string | null;
    about: string | null;
    video: string | null;
    authorized_zoom_app: string | null;
    zoom_refresh_token: boolean;
    created_at: string;
    updated_at: string;
  };

  export type Shareable = Omit<Self, "zoomRefreshToken">;
}
