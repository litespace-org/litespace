import { IFilter, ILesson } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { concat, first, merge, omit, orderBy } from "lodash";
import { users } from "@/users";
import {
  aggArrayOrder,
  knex,
  column,
  withPagination,
  addSqlMinutes,
} from "@/query";
import { calls } from "@/calls";
import zod from "zod";

export class Lessons {
  table = {
    lessons: "lessons",
    members: "lesson_members",
  } as const;

  columns = {
    lessons: (value: keyof ILesson.Row) => column(value, this.table.lessons),
    members: (value: keyof ILesson.MemberRow) =>
      column(value, this.table.members),
  } as const;

  rows: {
    lesson: Record<keyof ILesson.Row, string>;
  } = {
    lesson: {
      id: this.columns.lessons("id"),
      call_id: this.columns.lessons("call_id"),
      price: this.columns.lessons("price"),
      canceled_by: this.columns.lessons("canceled_by"),
      canceled_at: this.columns.lessons("canceled_at"),
      created_at: this.columns.lessons("created_at"),
      updated_at: this.columns.lessons("updated_at"),
    },
  } as const;

  filter = {
    lesson: Object.values(this.rows.lesson),
  } as const;

  async create(
    payload: ILesson.CreatePayload,
    tx: Knex.Transaction
  ): Promise<{ lesson: ILesson.Self; members: ILesson.Member[] }> {
    const now = dayjs.utc().toDate();
    const builder = this.builder(tx);

    const lessons = await builder.lessons
      .insert({
        call_id: payload.callId,
        price: payload.price,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const lesson = first(lessons.map((lesson) => this.from(lesson)));
    if (!lesson) throw new Error("Lesson not found; should never happen");

    const members = await builder.members
      .insert(
        concat(payload.members, payload.hostId).map((userId) => ({
          user_id: userId,
          lesson_id: lesson.id,
          host: userId === payload.hostId,
        }))
      )
      .returning("*");

    return {
      lesson,
      members: members.map((member) => this.asMember(member)),
    };
  }

  async cancel(
    id: number,
    canceledBy: number,
    tx: Knex.Transaction
  ): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .lessons.update({ canceled_by: canceledBy, canceled_at: now })
      .where("id", id);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<ILesson.Self | null> {
    const rows = await this.builder(tx).lessons.select("*").where({ id });
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findLessonMembers(
    lessonIds: number[],
    tx?: Knex.Transaction
  ): Promise<ILesson.PopuldatedMember[]> {
    const fields: Record<keyof ILesson.PopuldatedMemberRow, string> = {
      userId: users.column("id"),
      lessonId: this.columns.members("lesson_id"),
      host: this.columns.members("host"),
      email: users.column("email"),
      arabicName: users.column("name_ar"),
      englishName: users.column("name_en"),
      photo: users.column("photo"),
      role: users.column("role"),
      createdAt: users.column("created_at"),
      updatedAt: users.column("updated_at"),
    };

    const rows: ILesson.PopuldatedMemberRow[] = await users
      .builder(tx)
      .select<ILesson.PopuldatedMemberRow[]>(fields)
      .join(
        this.table.members,
        this.columns.members("user_id"),
        users.column("id")
      )
      .whereIn(this.columns.members("lesson_id"), lessonIds);

    return rows.map((row) => this.asPopulatedMember(row));
  }

  async findLessonsByMembers(
    members: number[],
    tx?: Knex.Transaction
  ): Promise<ILesson.Self[]> {
    const rows = await this.builder(tx)
      .members.join(
        this.table.lessons,
        this.columns.lessons("id"),
        this.columns.members("lesson_id")
      )
      .select<ILesson.Row[]>(this.rows.lesson)
      .groupBy(this.columns.members("user_id"))
      .havingRaw(aggArrayOrder(this.columns.members("user_id")), [
        orderBy(members),
      ]);

    return rows.map((row) => this.from(row));
  }

  async findMemberLessons(
    members: number[],
    pagination?: IFilter.Pagination,
    tx?: Knex.Transaction
  ): Promise<ILesson.Self[]> {
    const builder = this.builder(tx)
      .members.join(
        this.table.lessons,
        this.columns.lessons("id"),
        this.columns.members("lesson_id")
      )
      .join(
        calls.tables.calls,
        calls.columns.calls("id"),
        this.columns.lessons("call_id")
      )
      .select<ILesson.Row[]>(this.rows.lesson)
      .orderBy(calls.columns.calls("start"), "desc")
      .whereIn(this.columns.members("user_id"), members);

    const rows = await withPagination(builder, pagination).then();
    return rows.map((row) => this.from(row));
  }

  async sumPrice({
    canceled = true,
    future = true,
    users,
    tx,
  }: {
    users?: number[];
    canceled?: boolean;
    future?: boolean;
    tx?: Knex.Transaction;
  }): Promise<number> {
    const builder = this.builder(tx)
      .lessons.join(
        calls.tables.calls,
        calls.columns.calls("id"),
        this.columns.lessons("call_id")
      )
      .sum(this.columns.lessons("price"), { as: "price" });

    //! Because of the one-to-many relationship between the lesson and its
    //! members. We should only perform the join in case the `users` param is
    //! provider. We will get duplicated rows if we did this by default which
    //! will douple the total sum for the prices.
    if (users)
      builder
        .join(
          this.table.members,
          this.columns.members("lesson_id"),
          this.columns.lessons("id")
        )
        .whereIn(this.columns.members("user_id"), users);

    if (!canceled)
      builder.where(this.columns.lessons("canceled_by"), "IS", null);

    if (!future)
      builder.where(
        addSqlMinutes(
          calls.columns.calls("start"),
          calls.columns.calls("duration")
        ),
        "<=",
        dayjs.utc().toDate()
      );

    const row: { price: string } | undefined = await builder.first().then();
    return row ? zod.coerce.number().parse(row.price) : 0;
  }

  from(row: ILesson.Row): ILesson.Self {
    return {
      id: row.id,
      price: row.price,
      callId: row.call_id,
      canceledBy: row.canceled_by,
      canceledAt: row.canceled_at ? row.canceled_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asMember(row: ILesson.MemberRow): ILesson.Member {
    return {
      userId: row.user_id,
      lessonId: row.lesson_id,
      host: row.host,
    };
  }

  asPopulatedMember(
    row: ILesson.PopuldatedMemberRow
  ): ILesson.PopuldatedMember {
    return merge(
      omit(row, "arabicName", "englishName", "createdAt", "updatedAt"),
      {
        name: { ar: row.arabicName, en: row.englishName },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }
    );
  }

  builder(tx?: Knex.Transaction) {
    return {
      lessons: tx
        ? tx<ILesson.Row>(this.table.lessons)
        : knex<ILesson.Row>(this.table.lessons),
      members: tx
        ? tx<ILesson.MemberRow>(this.table.members)
        : knex<ILesson.MemberRow>(this.table.members),
    };
  }
}

export const lessons = new Lessons();
