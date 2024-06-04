import { query, withTransaction } from "@/models/query";
import { DeepPartial } from "@/types/utils";
import { first } from "lodash";
import { users } from "@/models";
import { IUser } from "@litespace/types";

export class Tutors {
  async create(
    user: IUser.Credentials & { name: string }
  ): Promise<Tutor.FullTutor> {
    return withTransaction(async (client) => {
      const { rows } = await client.query<IUser.Row>(
        `
        INSERT INTO
            "users" (
                "email",
                "password",
                "name",
                "type",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, $3, 'tutor', NOW(), NOW())
        RETURNING
            id, email, name, avatar, type, active, created_at, updated_at;
      `,
        [user.email, user.password, user.name]
      );

      const row = first(rows);
      if (!row) throw new Error("User not found; should never happen");
      const mapped = users.from(row);

      await client.query(
        `
        INSERT INTO
            tutors (id, bio, about, video, created_at, updated_at)
        VALUES ($1, null, null, null, NOW(), NOW());
        `,
        [mapped.id]
      );

      return {
        ...mapped,
        zoomRefreshToken: null,
        aquiredRefreshTokenAt: null,
        authorizedZoomApp: false,
        bio: null,
        about: null,
        video: null,
      };
    });
  }

  async update(
    tutor: DeepPartial<Omit<Tutor.Self, "createdAt" | "updatedAt">> & {
      id: number;
    }
  ): Promise<void> {
    await query(
      `
        UPDATE tutors
        SET
            bio = COALESCE($1, bio),
            about = COALESCE($2, about),
            video = COALESCE($3, video),
            updated_at = NOW()
        where
            id = $4;
        `,
      [tutor.bio, tutor.about, tutor.video, tutor.id]
    );
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM tutors WHERE id = $1;`, [id]);
  }

  async findById(id: number): Promise<Tutor.Shareable | null> {
    const { rows } = await query<Tutor.Row, [number]>(
      `
        SELECT
            id,
            bio,
            about,
            video,
            authorized_zoom_app,
            aquired_refresh_token_at,
            created_at,
            updated_at
        FROM tutors
        WHERE
            id = $1;
            
     `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.asSherable(row);
  }

  async findMany(ids: number[]): Promise<Tutor.Shareable[]> {
    const { rows } = await query<Tutor.Row, [number[]]>(
      `
        SELECT
            id,
            bio
            about
            video
            authorized_zoom_app,
            aquired_refresh_token_at,
            created_at,
            updated_at
        FROM tutors
        WHERE
            id in $1;
     `,
      [ids]
    );

    return rows.map((row) => this.asSherable(row));
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

  asSherable(row: Tutor.Row): Tutor.Shareable {
    return {
      id: row.id,
      bio: row.bio,
      about: row.about,
      video: row.video,
      aquiredRefreshTokenAt:
        row.aquired_refresh_token_at?.toISOString() || null,
      authorizedZoomApp: row.authorized_zoom_app,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export namespace Tutor {
  export type Self = {
    id: number;
    bio: string | null;
    about: string | null;
    video: string | null;
    zoomRefreshToken: string | null;
    aquiredRefreshTokenAt: string | null;
    authorizedZoomApp: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type FullTutor = IUser.Self & {
    bio: string | null;
    about: string | null;
    video: string | null;
    zoomRefreshToken: string | null;
    aquiredRefreshTokenAt: string | null;
    authorizedZoomApp: boolean;
  };

  export type Row = {
    id: number;
    bio: string | null;
    about: string | null;
    video: string | null;
    authorized_zoom_app: boolean;
    zoom_refresh_token: boolean;
    aquired_refresh_token_at: Date | null;
    created_at: Date;
    updated_at: Date;
  };

  export type Shareable = Omit<Self, "zoomRefreshToken">;
}
