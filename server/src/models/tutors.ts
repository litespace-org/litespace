import { knex } from "@/models/query";
import { first, isEmpty, values } from "lodash";
import { IUser, ITutor } from "@litespace/types";
import { isValuedObject } from "@/lib/utils";

export class Tutors {
  async create(
    user: IUser.Credentials & { name: string }
  ): Promise<ITutor.FullTutor> {
    const now = new Date();
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
            created_at: now,
            updated_at: now,
          },
          "id"
        )
        .then(async (rows) => {
          const row = first(rows);
          if (!row) throw new Error("User not found; should never happen");
          // then add it as a tutor in the tutors table
          return await knex<ITutor.Row>("tutors")
            .transacting(tx)
            .insert({ id: row.id, created_at: now, updated_at: now });
        })
        .then(tx.commit)
        .catch(tx.rollback);
    });

    const tutor = await this.findByEmail(user.email);
    if (!tutor) throw new Error("Tutor not found; should never happen");
    return tutor;
  }

  async update(id: number, tutor: ITutor.UpdatePayload): Promise<void> {
    const updateUserPayload: Partial<IUser.Row> = {
      email: tutor.email,
      name: tutor.name,
      password: tutor.password,
      photo: tutor.photo,
      // birth_year: tutor.birthday ? new Date(tutor.birthday) : undefined,
      gender: tutor.gender,
    } as const;

    if (isValuedObject(updateUserPayload))
      await knex<IUser.Row>("users")
        .update({
          ...updateUserPayload,
          updated_at: new Date(),
        })
        .where("id", id);

    const updateTutorPayload: Partial<ITutor.Row> = {
      bio: tutor.bio,
      about: tutor.about,
      video: tutor.video,
      activated: tutor.activated,
      activated_by: tutor.activatedBy,
      passed_interview: tutor.passedInterview,
      interview_url: tutor.interviewUrl,
    } as const;

    if (isValuedObject(updateTutorPayload))
      await knex<ITutor.Row>("tutors")
        .update({
          ...updateTutorPayload,
          updated_at: new Date(),
        })
        .where("id", id);
  }

  async delete(id: number): Promise<void> {
    await knex.transaction((tx) => {
      knex<ITutor.Row>("tutors") // delete from the tutors table first
        .transacting(tx)
        .where("id", id)
        .del()
        .then(
          async () =>
            // then delete it from the users table
            await knex<IUser.Row>("users").transacting(tx).where("id", id).del()
        )
        .then(tx.commit)
        .catch(tx.rollback);
    });
    await knex<ITutor.Row>("tutors").where("id", id).del();
  }

  async findByEmail(email: string): Promise<ITutor.FullTutor | null> {
    const tutors = await this.getSelectQuery().where("email", email).limit(1);
    return first(tutors) || null;
  }

  async findById(id: number): Promise<ITutor.FullTutor | null> {
    const tutors = await this.getSelectQuery().where("tutors.id", id).limit(1);
    return first(tutors) || null;
  }

  async findAll(): Promise<ITutor.FullTutor[]> {
    return await this.getSelectQuery();
  }

  async findTutorsMedia(): Promise<ITutor.TutorMedia[]> {
    return await knex<IUser.Row>("users")
      .select<ITutor.TutorMedia[]>({
        id: "users.id",
        email: "users.email",
        name: "users.name",
        photo: "users.photo",
        video: "tutors.video",
      })
      .innerJoin("tutors", "users.id", "tutors.id");
  }

  async findTutorMediaById(id: number): Promise<ITutor.TutorMedia | null> {
    const list = await knex<IUser.Row>("users")
      .select<ITutor.TutorMedia[]>({
        id: "users.id",
        email: "users.email",
        name: "users.name",
        photo: "users.photo",
        video: "tutors.video",
      })
      .innerJoin("tutors", "users.id", "tutors.id")
      .where("users.id", id);

    return first(list) || null;
  }

  getSelectQuery() {
    return knex
      .select<ITutor.FullTutor[]>({
        id: "users.id",
        email: "users.email",
        name: "users.name",
        photo: "users.photo",
        type: "users.type",
        // birthday: "users.birthday",
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
        interviewUrl: "tutors.interview_url",
      })
      .from<IUser.Row>("users")
      .innerJoin<IUser.Row>("tutors", "users.id", "tutors.id")
      .clone();
  }
}

export const tutors = new Tutors();
