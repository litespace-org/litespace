import { column, countRows, knex, withFilter, withPagination } from "@/query";
import { first, isEmpty, merge, omit } from "lodash";
import { IUser, ITutor, IFilter, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { users } from "@/users";
import dayjs from "@/lib/dayjs";

type TutorMediaFieldsMap = Record<keyof ITutor.TutorMedia, string>;
type FullTutorFields = ITutor.FullTutorRow;
type FullTutorFieldsMap = Record<keyof FullTutorFields, string>;

const tutorColumn = (key: keyof ITutor.Row) => column(key, "tutors");

const fullTutorFields: FullTutorFieldsMap = {
  id: users.column("id"),
  email: users.column("email"),
  name: users.column("name"),
  image: users.column("image"),
  role: users.column("role"),
  password: users.column("password"),
  birthYear: users.column("birth_year"),
  gender: users.column("gender"),
  online: users.column("online"),
  verified: users.column("verified"),
  creditScore: users.column("credit_score"),
  createdAt: users.column("created_at"),
  updatedAt: users.column("updated_at"),
  metaUpdatedAt: tutorColumn("updated_at"),
  bio: tutorColumn("bio"),
  about: tutorColumn("about"),
  video: tutorColumn("video"),
  notice: tutorColumn("notice"),
  activated: tutorColumn("activated"),
  activatedBy: tutorColumn("activated_by"),
} as const;

const tutorMediaFields: TutorMediaFieldsMap = {
  id: users.column("id"),
  email: users.column("email"),
  name: users.column("name"),
  image: users.column("image"),
  video: tutorColumn("video"),
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
    const now = dayjs.utc().toDate();
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
    payload: ITutor.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    const now = dayjs().utc().toDate();
    await this.builder(tx)
      .update({
        bio: payload.bio,
        about: payload.about,
        video: payload.video,
        notice: payload.notice,
        activated: payload.activated,
        activated_by: payload.activatedBy,
        updated_at: now,
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

  async findForMediaProvider(
    pagination?: IFilter.Pagination,
    tx?: Knex.Transaction
  ): Promise<Paginated<ITutor.PublicTutorFieldsForMediaProvider>> {
    const columns: Record<
      keyof ITutor.PublicTutorFieldsForMediaProvider,
      string
    > = {
      id: this.column("id"),
      email: users.column("email"),
      name: users.column("name"),
      image: users.column("image"),
      video: this.column("video"),
      createdAt: this.column("created_at"),
    } as const;
    const builder = this.builder(tx).join(
      users.table,
      this.column("id"),
      users.column("id")
    );
    const total = await countRows(builder.clone());
    const main = builder
      .clone()
      .select<ITutor.PublicTutorFieldsForMediaProvider[]>(columns)
      .orderBy([
        { column: this.column("created_at"), order: "desc" },
        { column: this.column("id"), order: "asc" },
      ]);
    const list = await withPagination(main, pagination);
    return { list, total };
  }

  async findSelfById(id: number): Promise<ITutor.Self | null> {
    const rows = await knex<ITutor.Row>(this.table).select("*").where("id", id);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findTutorsMedia(filter?: IFilter.Self): Promise<ITutor.TutorMedia[]> {
    const builder = knex<IUser.Row>(users.table)
      .select<ITutor.TutorMedia[]>(this.columns.tutorMediaFields.map)
      .innerJoin(this.table, users.column("id"), this.column("id"));

    const rows = await withFilter({
      builder,
      filter,
      defaults: {
        search: { columns: this.columns.tutorMediaFields.filterable },
      },
    });

    return rows;
  }

  async findTutorMediaById(id: number): Promise<ITutor.TutorMedia | null> {
    const row = await knex<IUser.Row>(users.table)
      .select<ITutor.TutorMedia[]>(this.columns.tutorMediaFields.map)
      .innerJoin(this.table, users.column("id"), this.column("id"))
      .where(users.column("id"), id)
      .first();

    return row || null;
  }

  async findActivatedTutors(
    tx?: Knex.Transaction
  ): Promise<ITutor.FullTutor[]> {
    const rows = await this.fullTutorQuery(tx).where(
      this.column("activated"),
      true
    );
    return rows.map((row) => this.asFullTutor(row));
  }

  fullTutorQuery(tx?: Knex.Transaction) {
    return this.builder(tx)
      .select<ITutor.FullTutorRow[]>(this.columns.fullTutorFields.map)
      .from<IUser.Row>(users.table)
      .innerJoin<IUser.Row>(this.table, users.column("id"), this.column("id"))
      .clone();
  }

  from(row: ITutor.Row): ITutor.Self {
    return {
      id: row.id,
      bio: row.bio,
      about: row.about,
      video: row.video,
      notice: row.notice,
      activated: row.activated,
      activatedBy: row.activated_by,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asFullTutor(row: ITutor.FullTutorRow): ITutor.FullTutor {
    return merge(omit(row), {
      password: row.password !== null,
    });
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<ITutor.Row>(this.table) : knex<ITutor.Row>(this.table);
  }

  column(key: keyof ITutor.Row): string {
    return tutorColumn(key);
  }
}

export const tutors = new Tutors();
