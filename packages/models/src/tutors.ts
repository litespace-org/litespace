import {
  column,
  countRows,
  knex,
  withNumericFilter,
  withDateFilter,
  withStringFilter,
  WithOptionalTx,
  withPagination,
  withSkippablePagination,
  withBooleanFilter,
  withNullableFilter,
  withListFilter,
} from "@/query";
import { first, isEmpty } from "lodash";
import { IUser, ITutor, IFilter, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { users } from "@/users";
import dayjs from "@/lib/dayjs";
import zod from "zod";

type FullTutorFields = ITutor.FullRow;
type FullTutorFieldsMap = Record<keyof FullTutorFields, string>;

const tutorColumn = (key: keyof ITutor.Row) => column(key, "tutors");

const fullTutorFields: FullTutorFieldsMap = {
  id: users.column("id"),
  email: users.column("email"),
  name: users.column("name"),
  image: users.column("image"),
  address: users.column("address"),
  role: users.column("role"),
  password: users.column("password"),
  birth_year: users.column("birth_year"),
  gender: users.column("gender"),
  verified_email: users.column("verified_email"),
  verified_phone: users.column("verified_phone"),
  verified_whatsapp: users.column("verified_whatsapp"),
  verified_telegram: users.column("verified_telegram"),
  credit_score: users.column("credit_score"),
  city: users.column("city"),
  phone: users.column("phone"),
  notification_method: users.column("notification_method"),
  user_created_at: users.column("created_at"),
  user_updated_at: users.column("updated_at"),
  tutor_created_at: tutorColumn("created_at"),
  tutor_updated_at: tutorColumn("updated_at"),
  bio: tutorColumn("bio"),
  about: tutorColumn("about"),
  video: tutorColumn("video"),
  studio_id: tutorColumn("studio_id"),
  thumbnail: tutorColumn("thumbnail"),
  notice: tutorColumn("notice"),
  activated: tutorColumn("activated"),
} as const;

export class Tutors {
  table = "tutors";

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
        studio_id: payload.studioId,
        updated_at: now,
      })
      .where(this.column("id"), id);
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

  async findByEmail(email: string): Promise<ITutor.Full | null> {
    const tutors = await this.fullTutorQuery().where("email", email).limit(1);
    const tutor = first(tutors);
    if (!tutor) return null;
    return this.asFull(tutor);
  }

  async findById(id: number): Promise<ITutor.Full | null> {
    const tutors = await this.fullTutorQuery().where("tutors.id", id).limit(1);
    const tutor = first(tutors);
    if (!tutor) return null;
    return this.asFull(tutor);
  }

  async exists(id: number): Promise<boolean> {
    const rows = await knex<ITutor.Row>("tutors").select("id").where("id", id);
    return !isEmpty(rows);
  }

  async find({
    tx,
    about,
    bio,
    name,
    phone,
    email,
    activated,
    password,
    image,
    thumbnail,
    video,
    verifiedEmail,
    verifiedPhone,
    verifiedTelegram,
    verifiedWhatsapp,
    birthYear,
    notice,
    createdAt,
    city,
    gender,
    notificationMethod,
    ...pagination
  }: WithOptionalTx<ITutor.FindQueryModel>): Promise<Paginated<ITutor.Full>> {
    const builder = this.builder(tx)
      .from<IUser.Row>(users.table)
      .innerJoin<IUser.Row>(this.table, users.column("id"), this.column("id"));

    // ============== string fields ========
    withStringFilter(builder, this.column("bio"), bio);
    withStringFilter(builder, this.column("about"), about);
    withStringFilter(builder, users.column("name"), name);
    withStringFilter(builder, users.column("phone"), phone);
    withStringFilter(builder, users.column("email"), email);

    // ============== boolean fields ========
    withBooleanFilter(builder, this.column("activated"), activated);
    withBooleanFilter(builder, users.column("verified_email"), verifiedEmail);
    withBooleanFilter(builder, users.column("verified_phone"), verifiedPhone);
    withBooleanFilter(
      builder,
      users.column("verified_telegram"),
      verifiedTelegram
    );
    withBooleanFilter(
      builder,
      users.column("verified_whatsapp"),
      verifiedWhatsapp
    );

    // ============== nullable fields ========
    withNullableFilter(builder, this.column("video"), video);
    withNullableFilter(builder, users.column("image"), image);
    withNullableFilter(builder, this.column("thumbnail"), thumbnail);
    withNullableFilter(builder, users.column("password"), password);

    // ============== numerical fileds ========
    withNumericFilter(builder, users.column("birth_year"), birthYear);
    withNumericFilter(builder, this.column("notice"), notice);
    // ============== date fields ========
    withDateFilter(builder, users.column("created_at"), createdAt);

    // ==============  list-based fileds ========
    withListFilter(builder, users.column("city"), city);
    withListFilter(
      builder,
      users.column("notification_method"),
      notificationMethod
    );
    withListFilter(builder, users.column("gender"), gender);

    const total = await countRows(builder.clone(), { distinct: true });
    const query = builder
      .select<ITutor.FullRow[]>(fullTutorFields)
      .orderBy(tutors.column("created_at"), "desc");
    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.asFull(row));

    return { list, total };
  }

  /**
   * @description retrieves all tutors for a specific studio if `studioId` is
   * defined, otherwise retrieves all tutors for all studios.
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

    const builder = this.builder(tx).join(
      users.table,
      this.column("id"),
      users.column("id")
    );

    if (studioId) builder.where(this.column("studio_id"), studioId);

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

  async findOnboardedTutors(tx?: Knex.Transaction): Promise<ITutor.Full[]> {
    const rows = await this.fullTutorQuery(tx)
      .where(this.column("activated"), true)
      .andWhereNot(this.column("video"), null)
      .andWhereNot(this.column("bio"), null)
      .andWhereNot(this.column("about"), null)
      .andWhereNot(users.column("image"), null)
      .andWhereNot(users.column("birth_year"), null)
      .andWhereNot(users.column("name"), null)
      .andWhereNot(users.column("gender"), null)
      .andWhere(users.column("verified_email"), true);
    return rows.map((row) => this.asFull(row));
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
        SELECT s1.tutorId FROM (
          SELECT 
            tutors.id AS tutorId,
            tutors.about AS about,
            tutors.bio AS bio,
            tutors.activated AS activated,
            tutors.video AS video,
            tutors.thumbnail AS thumbnail,
            tutors.studio_id AS studio_id,
          FROM room_members rm1
          JOIN room_members rm2 ON rm1.room_id = rm2.room_id
          RIGHT JOIN tutors ON tutors.id = rm2.user_id
          GROUP BY tutors.id
          HAVING COUNT(rm1.user_id = 2 OR NULL) = 0
        ) s1 JOIN users ON s1.tutorId = users.id
        WHERE 
          users.name IS NOT null AND
          about IS NOT null AND
          bio IS NOT null AND
          users.image IS NOT null AND
          users.phone IS NOT null AND
          users.city IS NOT null AND
          users.verified_email = true AND 
          (users.role = 5 OR ( 
            users.verified_phone = true AND
            video IS NOT null AND
            thumbnail IS NOT null AND
            studio_id IS NOT null AND
            activated = true AND
            users.birth_year IS NOT null 
          ))
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

    const s1 = knex
      .select("tutors.id AS tutorId")
      .select("tutors.about AS about")
      .select("tutors.bio AS bio")
      .select("tutors.activated AS activated")
      .select("tutors.video AS video")
      .select("tutors.thumbnail AS thumbnail")
      .select("tutors.studio_id AS studio_id")
      .from("room_members AS rm1")
      .join("room_members AS rm2", "rm1.room_id", "rm2.room_id")
      .rightJoin(this.table, this.column("id"), "rm2.user_id")
      .groupBy(this.column("id"))
      .havingRaw(`COUNT(rm1.user_id = ${student} OR NULL) = 0`)
      .as("s1");

    const innerSelect = knex
      .select("s1.tutorId")
      .from(s1)
      .join(users.table, "s1.tutorId", users.column("id"))
      .whereNotNull(users.column("name"))
      .whereNotNull("s1.about")
      .whereNotNull("s1.bio")
      .whereNotNull(users.column("image"))
      .whereNotNull(users.column("phone"))
      .whereNotNull(users.column("city"))
      .where(users.column("verified_email"), "=", true)
      .where((q1) => {
        q1.where(users.column("role"), "=", IUser.Role.TutorManager).orWhere(
          (q2) => {
            q2.where(users.column("verified_phone"), "=", true);
            q2.whereNotNull(users.column("birth_year"));
            q2.where("s1.activated", "=", true);
            q2.whereNotNull("s1.video");
            q2.whereNotNull("s1.thumbnail");
            q2.whereNotNull("s1.studio_id");
          }
        );
      });

    const row = await knex.count("*").from(innerSelect).first();
    const total = row ? zod.coerce.number().parse(row.count) : 0;

    const list = await this.builder(tx)
      .select(selectObj)
      .join(users.table, users.column("id"), this.column("id"))
      .whereIn(
        this.column("id"),
        // NOTE: pagination is applied in the inner select query
        // in order to optain more sql query performance.
        withPagination(innerSelect.clone(), pagination)
      );

    return { list, total };
  }

  fullTutorQuery(tx?: Knex.Transaction) {
    return this.builder(tx)
      .select<ITutor.FullRow[]>(fullTutorFields)
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
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asFull(row: ITutor.FullRow): ITutor.Full {
    return {
      ...users.from({
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        image: row.image,
        address: row.address,
        birth_year: row.birth_year,
        gender: row.gender,
        role: row.role,
        verified_email: row.verified_email,
        verified_phone: row.verified_phone,
        verified_whatsapp: row.verified_whatsapp,
        verified_telegram: row.verified_telegram,
        credit_score: row.credit_score,
        phone: row.phone,
        city: row.city,
        notification_method: row.notification_method,
        created_at: row.user_created_at,
        updated_at: row.user_updated_at,
      }),
      id: row.id,
      bio: row.bio,
      about: row.about,
      video: row.video,
      thumbnail: row.thumbnail,
      studioId: row.studio_id,
      notice: row.notice,
      activated: row.activated,
      meta: {
        createdAt: row.tutor_created_at.toISOString(),
        updatedAt: row.tutor_updated_at.toISOString(),
      },
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<ITutor.Row>(this.table) : knex<ITutor.Row>(this.table);
  }

  column(key: keyof ITutor.Row) {
    return tutorColumn(key);
  }
}

export const tutors = new Tutors();
