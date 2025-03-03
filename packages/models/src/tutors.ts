import {
  column,
  countRows,
  knex,
  withFilter,
  WithOptionalTx,
  withPagination,
} from "@/query";
import { first, isEmpty, merge, omit } from "lodash";
import { IUser, ITutor, IFilter, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { users } from "@/users";
import dayjs from "@/lib/dayjs";
import zod from "zod";

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
  verified: users.column("verified"),
  creditScore: users.column("credit_score"),
  city: users.column("city"),
  phoneNumber: users.column("phone_number"),
  createdAt: users.column("created_at"),
  updatedAt: users.column("updated_at"),
  metaUpdatedAt: tutorColumn("updated_at"),
  bio: tutorColumn("bio"),
  about: tutorColumn("about"),
  video: tutorColumn("video"),
  studioId: tutorColumn("studio_id"),
  thumbnail: tutorColumn("thumbnail"),
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
        thumbnail: payload.thumbnail,
        activated: payload.activated,
        activated_by: payload.activatedBy,
        studio_id: payload.studioId,
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

  /**
   * @description retrieves all tutors for a specific studio if @param studioId is defined,
   * otherwise retrieves all tutors for all studios.
   */
  async findStudioTutors({
    studioId,
    search,
    tx,
    ...pagination
  }: WithOptionalTx<{
    studioId?: number;
    search?: string;
  }> &
    IFilter.Pagination): Promise<Paginated<ITutor.StudioTutorFields>> {
    const columns: Record<keyof ITutor.StudioTutorFields, string> = {
      id: this.column("id"),
      email: users.column("email"),
      name: users.column("name"),
      image: users.column("image"),
      video: this.column("video"),
      thumbnail: this.column("thumbnail"),
      studioId: this.column("studio_id"),
      createdAt: this.column("created_at"),
    } as const;

    const builder = studioId
      ? this.builder(tx)
          .join(users.table, this.column("id"), users.column("id"))
          .where(this.column("studio_id"), studioId)
      : this.builder(tx)
          .join(users.table, this.column("id"), users.column("id"))
          .whereNot(this.column("studio_id"), null);

    if (search)
      builder
        .whereLike(users.column("email"), `%${search}%`)
        .orWhereLike(users.column("name"), `%${search}%`);

    const total = await countRows(builder.clone());

    const main = builder
      .clone()
      .select<ITutor.StudioTutorFieldsRow[]>(columns)
      .orderBy([
        { column: this.column("created_at"), order: "desc" },
        { column: this.column("id"), order: "asc" },
      ]);

    const list = await withPagination(main, pagination);
    return {
      list: list.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  async findStudioTutor(
    tutorId: number,
    tx?: Knex.Transaction
  ): Promise<ITutor.StudioTutorFields | null> {
    const columns: Record<keyof ITutor.StudioTutorFields, string> = {
      id: this.column("id"),
      email: users.column("email"),
      name: users.column("name"),
      image: users.column("image"),
      video: this.column("video"),
      thumbnail: this.column("thumbnail"),
      createdAt: this.column("created_at"),
      studioId: this.column("studio_id"),
    } as const;

    const row = await this.builder(tx)
      .join(users.table, this.column("id"), users.column("id"))
      .where(users.column("id"), tutorId)
      .select<ITutor.StudioTutorFieldsRow[]>(columns)
      .first();

    if (!row) return null;
    return { ...row, createdAt: row.createdAt.toISOString() };
  }

  async findTutorAssets(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ITutor.Assets | null> {
    const columns: Record<keyof ITutor.Assets, string> = {
      tutorId: this.column("id"),
      image: users.column("image"),
      video: this.column("video"),
      thumbnail: this.column("thumbnail"),
      studioId: this.column("studio_id"),
    } as const;

    const row = await this.builder(tx)
      .join(users.table, this.column("id"), users.column("id"))
      .select<ITutor.Assets[]>(columns)
      .where(this.column("id"), id)
      .first();

    return row || null;
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

  async findOnboardedTutors(
    tx?: Knex.Transaction
  ): Promise<ITutor.FullTutor[]> {
    const rows = await this.fullTutorQuery(tx)
      .where(this.column("activated"), true)
      .andWhereNot(this.column("video"), null)
      .andWhereNot(this.column("bio"), null)
      .andWhereNot(this.column("about"), null)
      .andWhereNot(users.column("image"), null)
      .andWhereNot(users.column("birth_year"), null)
      .andWhereNot(users.column("name"), null)
      .andWhereNot(users.column("gender"), null)
      .andWhere(users.column("verified"), true);
    return rows.map((row) => this.asFullTutor(row));
  }

  async findUncontactedTutorsForStudent({
    student,
    pagination,
    tx,
  }: {
    student: number;
    pagination?: IFilter.Pagination;
    tx?: Knex.Transaction;
  }): Promise<Paginated<ITutor.UncontactedTutorInfo>> {
    /*
      SELECT * FROM tutors
      JOIN users ON tutors.id = users.id
      WHERE tutors.id IN (
        SELECT tutors.id FROM room_members rm1
        JOIN room_members rm2 ON rm1.room_id = rm2.room_id
        RIGHT JOIN tutors ON tutors.id = rm2.user_id
        GROUP BY tutors.id
        HAVING COUNT(rm1.user_id = 2 OR NULL) = 0
      );
     */

    const selectObj: Record<keyof ITutor.UncontactedTutorInfo, string> = {
      id: users.column("id"),
      image: users.column("image"),
      bio: this.column("bio"),
      name: users.column("name"),
      gender: users.column("gender"),
      role: users.column("role"),
      lastSeen: users.column("updated_at"),
    };

    // NOTE: pagination is applied in the inner select query
    // in order to optain more sql query performance.
    const innerSelect = knex
      .select(this.column("id"))
      .from("room_members AS rm1")
      .join("room_members AS rm2", "rm1.room_id", "rm2.room_id")
      .rightJoin(this.table, this.column("id"), "rm2.user_id")
      .groupBy(this.column("id"))
      .havingRaw(`COUNT(rm1.user_id = ${student} OR NULL) = 0`);

    const row = await knex.count("*").from(innerSelect).first();
    const total = row ? zod.coerce.number().parse(row.count) : 0;

    const list = await this.builder(tx)
      .select(selectObj)
      .join(users.table, users.column("id"), this.column("id"))
      .whereIn(
        this.column("id"),
        withPagination(innerSelect.clone(), pagination)
      );

    return { list, total };
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
      thumbnail: row.thumbnail,
      studioId: row.studio_id,
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
