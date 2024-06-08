import { knex, query } from "@/models/query";
import { DeepPartial } from "@/types/utils";
import { first } from "lodash";
import { IUser, ITutor } from "@litespace/types";

export class Tutors {
  async create(
    user: IUser.Credentials & { name: string }
  ): Promise<ITutor.FullTutor> {
    await knex.transaction((tx) => {
      // add tutor to the users table first
      knex<IUser.Row>("users")
        .transacting(tx)
        .insert(
          {
            email: user.email,
            password: user.password,
            name: user.name,
            type: IUser.Type.Tutor,
          },
          "id"
        )
        .then(async (rows) => {
          const row = first(rows);
          if (!row) throw new Error("User not found; should never happen");
          // then add it as tutor in the tutors table
          return await knex<ITutor.Row>("tutors")
            .transacting(tx)
            .insert({ id: row.id });
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
    const tutors = await this.getSelectQuery().where("email", email).limit(1);
    return first(tutors) || null;
  }

  async findById(id: number): Promise<ITutor.FullTutor | null> {
    const tutors = await this.getSelectQuery().where("id", id).limit(1);
    return first(tutors) || null;
  }

  getSelectQuery() {
    return knex
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
      .from<IUser.Row>("users")
      .innerJoin<IUser.Row>("tutors", "users.id", "tutors.id")
      .clone();
  }
}

export const tutors = new Tutors();
