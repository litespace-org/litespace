import { knex, withFilter } from "@/models/query";
import { first, isEmpty, merge, omit } from "lodash";
import { IUser, ITutor, IFilter } from "@litespace/types";
import { Knex } from "knex";

type TutorMediaFieldsMap = Record<keyof ITutor.TutorMedia, string>;
type FullTutorFields = ITutor.FullTutorRow;
type FullTutorFieldsMap = Record<keyof FullTutorFields, string>;

const fullTutorFields: FullTutorFieldsMap = {
  id: "users.id",
  email: "users.email",
  arabicName: "users.name_ar",
  englishName: "users.name_en",
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

  async update(
    id: number,
    tutor: ITutor.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    await this.builder(tx)
      .update({
        bio: tutor.bio,
        about: tutor.about,
        video: tutor.video,
        activated: tutor.activated,
        activated_by: tutor.activatedBy,
        media_provider_id: tutor.mediaProviderId,
        passed_interview: tutor.passedInterview,
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
    const tutor = first(tutors);
    if (!tutor) return null;
    return this.asFullTutor(tutor);
  }

  async findById(id: number): Promise<ITutor.FullTutor | null> {
    const tutors = await this.fullTutorQuery().where("tutors.id", id).limit(1);
    const tutor = first(tutors);
    if (!tutor) return null;
    return this.asFullTutor(tutor);
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

  async findSelfById(id: number): Promise<ITutor.Self | null> {
    const rows = await knex<ITutor.Row>(this.table).select("*").where("id", id);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
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
      .select<ITutor.FullTutorRow[]>(this.columns.fullTutorFields.map)
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

  asFullTutor(row: ITutor.FullTutorRow): ITutor.FullTutor {
    return merge(omit(row, "arabicName", "englishName"), {
      name: { ar: row.arabicName, en: row.englishName },
      password: row.password !== null,
    });
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<ITutor.Row>(this.table) : knex<ITutor.Row>(this.table);
  }
}

export const tutors = new Tutors();
