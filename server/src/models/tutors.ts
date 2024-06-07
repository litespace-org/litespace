import { knex, query, withTransaction } from "@/models/query";
import { DeepPartial } from "@/types/utils";
import { first } from "lodash";
import { users } from "@/models";
import { IUser, ITutor } from "@litespace/types";

export class Tutors {
  async create(
    user: IUser.Credentials & { name: string }
  ): Promise<ITutor.FullTutor> {
    await knex.transaction((tx) => {
      knex<IUser.Row>("users")
        .transacting(tx)
        .insert(
          {
            email: user.email,
            password: user.password,
            name: user.name,
            type: IUser.Type.Tutor,
          },
          "*"
        )
        .then(async (rows) => {
          const row = first(rows);
          if (!row) throw new Error("User not found; should never happen");
          return await knex<ITutor.Row>("tutors")
            .transacting(tx)
            .insert({ id: row.id }, "*");
        })
        .then(tx.commit)
        .catch(tx.rollback);
    });

    const tutor = await this.findByEmail(user.email);
    if (!tutor) throw new Error("Tutor not found; should never happen");
    return tutor;
  }

  async update(
    tutor: DeepPartial<Omit<ITutor.Self, "createdAt" | "updatedAt">> & {
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

  async findByEmail(email: string): Promise<ITutor.FullTutor | null> {
    const tutors = await knex
      .select<ITutor.FullTutor[]>({
        id: "users.id",
        email: "users.email",
        name: "users.name",
        avatar: "users.avatar",
        type: "users.type",
        birthday: "users.birthday",
        gender: "users.gender",
        online: "users.online",
        createdAt: "users.created_at",
        updatedAt: "users.updated_at",
        metaUpdatedAt: "tutors.updated_at",
        bio: "tutors.bio",
        about: "tutors.about",
        video: "tutors.video",
        activated: "tutors.activated",
        activatedBy: "tutors.activated_by",
        passedInterview: "tutors.passed_interview",
        privateFeedback: "tutors.private_feedback",
        publicFeedback: "tutors.public_feedback",
        interviewUrl: "tutors.interview_url",
      })
      .from("users")
      .innerJoin("tutors", "users.id", "tutors.id")
      .where("email", email);

    const tutor = first(tutors);
    return tutor || null;
  }

  async findById(id: number): Promise<ITutor.Shareable | null> {
    const { rows } = await query<ITutor.Row, [number]>(
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

  async findMany(ids: number[]): Promise<ITutor.Shareable[]> {
    const { rows } = await query<ITutor.Row, [number[]]>(
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

  // todo: fix this
  // asSherable(row: ITutor.Row): ITutor.Shareable {
  asSherable(row: ITutor.Row): any {
    return {
      id: row.id,
      bio: row.bio,
      about: row.about,
      video: row.video,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
