import { knex, withFilter } from "@/models/query";
import { first, fromPairs, isEmpty, omit } from "lodash";
import { IUser, ITutor, IFilter } from "@litespace/types";
import { isValuedObject } from "@/lib/utils";
import { Knex } from "knex";

type TutorMediaFieldsMap = Record<keyof ITutor.TutorMedia, string>;
type FullTutorFieldsMap = Record<keyof FullTutorFields, string>;
type FullTutorFields = Omit<ITutor.FullTutor, "hasPassword"> & {
  password: string;
};

const fullTutorFields: FullTutorFieldsMap = {
  id: "users.id",
  email: "users.email",
  name: "users.name",
  photo: "users.photo",
  role: "users.role",
  password: "users.password",
  birthYear: "users.birth_year",
  gender: "users.gender",
  online: "users.online",
  verified: "users.verified",
  creditScore: "users.credit_score",
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
  mediaProviderId: "tutors.media_provider_id",
} as const;

const tutorMediaFields: TutorMediaFieldsMap = {
  id: "users.id",
  email: "users.email",
  name: "users.name",
  photo: "users.photo",
  video: "tutors.video",
} as const;

export class Tutors {
  table = "tutors";
  columns: {
    fullTutorFields: {
      map: FullTutorFieldsMap;
      filterable: Array<keyof FullTutorFieldsMap>;
    };
    tutorMediaFields: {
      map: TutorMediaFieldsMap;
      filterable: Array<keyof TutorMediaFieldsMap>;
    };
  } = {
    fullTutorFields: {
      map: fullTutorFields,
      filterable: Object.values(omit(fullTutorFields, "password")) as Array<
        keyof FullTutorFields
      >,
    },
    tutorMediaFields: {
      map: tutorMediaFields,
      filterable: Object.values(tutorMediaFields) as Array<
        keyof TutorMediaFieldsMap
      >,
    },
  };

  async create(id: number, tx?: Knex.Transaction): Promise<ITutor.Self> {
    const now = new Date();
    const rows = await this.builder(tx)
      .insert({
        id,
        created_at: now,
        updated_at: now,
      })
      .returning("*");
    const row = first(rows);
    if (!row) throw new Error("Tutor not found; should never happen");
    return this.from(row);
  }

  async update(id: number, tutor: ITutor.UpdatePayload): Promise<void> {
    const updateUserPayload: Partial<IUser.Row> = {
      email: tutor.email,
      // name: tutor.name,
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
    const tutors = await this.fullTutorQuery().where("email", email).limit(1);
    return first(tutors) || null;
  }

  async findById(id: number): Promise<ITutor.FullTutor | null> {
    const tutors = await this.fullTutorQuery().where("tutors.id", id).limit(1);
    return first(tutors) || null;
  }

  async exists(id: number): Promise<boolean> {
    const rows = await knex<ITutor.Row>("tutors").select("id").where("id", id);
    return !isEmpty(rows);
  }

  async find(filter?: IFilter.Self): Promise<ITutor.FullTutor[]> {
    return await withFilter({
      builder: this.fullTutorQuery(),
      defaults: {
        search: { columns: this.columns.fullTutorFields.filterable },
      },
      filter,
    }).then();
  }

  async findTutorsMedia(filter?: IFilter.Self): Promise<ITutor.TutorMedia[]> {
    const builder = knex<IUser.Row>("users")
      .select<ITutor.TutorMedia[]>(this.columns.tutorMediaFields.map)
      .innerJoin("tutors", "users.id", "tutors.id");

    return withFilter({
      builder,
      filter,
      defaults: {
        search: { columns: this.columns.tutorMediaFields.filterable },
      },
    });
  }

  async findTutorMediaById(id: number): Promise<ITutor.TutorMedia | null> {
    const list = await knex<IUser.Row>("users")
      .select<ITutor.TutorMedia[]>(this.columns.tutorMediaFields.map)
      .innerJoin("tutors", "users.id", "tutors.id")
      .where("users.id", id);

    return first(list) || null;
  }

  fullTutorQuery() {
    return knex
      .select<ITutor.FullTutor[]>(this.columns.fullTutorFields.map)
      .from<IUser.Row>("users")
      .innerJoin<IUser.Row>("tutors", "users.id", "tutors.id")
      .clone();
  }

  from(row: ITutor.Row): ITutor.Self {
    return {
      id: row.id,
      bio: row.bio,
      about: row.about,
      activated: row.activated,
      activatedBy: row.activated_by,
      interviewUrl: row.interview_url,
      mediaProviderId: row.media_provider_id,
      passedInterview: row.passed_interview,
      video: row.video,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<ITutor.Row>(this.table) : knex<ITutor.Row>(this.table);
  }
}

export const tutors = new Tutors();
