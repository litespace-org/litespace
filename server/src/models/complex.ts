import { query } from "@/models/query";
import { IUser } from "@litespace/types";
import { first } from "lodash";

export class Complex {
  // todo: handle dates and types
  // todo: remove password
  async findActivatedTutors(): Promise<Complex.Tutor.Self[]> {
    const { rows } = await query<Complex.Tutor.Row, []>(`
        SELECT
            users.id as id,
            users.email as email,
            users.name as name,
            users.avatar as avatar,
            users.gender as gender,
            users.active as active,
            users.created_at as created_at,
            users.updated_at as updated_at,
            tutors.bio as bio,
            tutors.about as about,
            tutors.video as video,
            tutors.updated_at as meta_updated_at
        FROM users
            JOIN tutors on users.id = tutors.id
        WHERE
            users.id = tutors.id;
      `);

    return rows.map((row) => this.mapTutor(row));
  }

  async getTutorById(id: number): Promise<Complex.Tutor.Self | null> {
    const { rows } = await query<Complex.Tutor.Row, [id: number]>(
      `
        SELECT 
            users.id as id,
            users.email as email,
            users.name as name,
            users.avatar as avatar,
            users.gender as gender,
            users.active as active,
            users.created_at as created_at,
            users.updated_at as updated_at,
            tutors.bio as bio,
            tutors.about as about,
            tutors.video as video,
            tutors.updated_at as meta_updated_at
        FROM users
            JOIN tutors on users.id = tutors.id
        WHERE
            users.id = $1;
      `,
      [id]
    );

    const tutor = first(rows);
    if (!tutor) return null;
    return this.mapTutor(tutor);
  }

  mapTutor(row: Complex.Tutor.Row): Complex.Tutor.Self {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar,
      gender: row.gender,
      active: row.active,
      bio: row.bio,
      about: row.about,
      video: row.video,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      metaUpdatedAt: row.meta_updated_at.toISOString(),
    };
  }
}

export namespace Complex {
  export namespace Tutor {
    export type Row = {
      id: number;
      email: string;
      name: string | null;
      avatar: string | null;
      gender: IUser.Gender | null;
      active: boolean;
      bio: string | null;
      about: string | null;
      video: string | null;
      created_at: Date;
      updated_at: Date;
      meta_updated_at: Date;
    };

    export type Self = {
      id: number;
      email: string;
      name: string | null;
      avatar: string | null;
      gender: string | null;
      active: boolean;
      bio: string | null;
      about: string | null;
      video: string | null;
      createdAt: string;
      updatedAt: string;
      metaUpdatedAt: string;
    };
  }
}
