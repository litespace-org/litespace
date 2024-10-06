import { IFilter, ILesson, NumericString } from "@litespace/types";
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
  countRows,
} from "@/query";
import { calls } from "@/calls";
import zod from "zod";

type SearchFilter = {
  /**
   * User IDs to be included in the search
   */
  users?: number[];
  /**
   * Flag to include or execlude canceled lessons
   *
   * @default true (included)
   */
  canceled?: boolean;
  /**
   * Flag to include or execlude future lessons
   *
   * @default true (included)
   */
  future?: boolean;
};

type AggregateParams = SearchFilter & {
  column: string;
  tx?: Knex.Transaction;
};

type Builder = {
  lessons: Knex.QueryBuilder<ILesson.Row, ILesson.Row[]>;
  members: Knex.QueryBuilder<ILesson.MemberRow, ILesson.MemberRow[]>;
};

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
        call_id: payload.call,
        price: payload.price,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const lesson = first(lessons.map((lesson) => this.from(lesson)));
    if (!lesson) throw new Error("Lesson not found; should never happen");

    const members = await builder.members
      .insert(
        concat(payload.members, payload.host).map((userId) => ({
          user_id: userId,
          lesson_id: lesson.id,
          host: userId === payload.host,
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
      name: users.column("name"),
      image: users.column("image"),
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
    const rows: ILesson.Row[] = await this.builder(tx)
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

  async sumPrice(params: Omit<AggregateParams, "column">): Promise<number> {
    const column = this.columns.lessons("price");
    return await this.sum({ ...params, column });
  }

  async sumDuration(params: Omit<AggregateParams, "column">) {
    const column = calls.columns.calls("duration");
    return await this.sum({ ...params, column });
  }

  async sum({
    canceled = true,
    future = true,
    users,
    column,
    tx,
  }: AggregateParams) {
    const base = this.builder(tx)
      .lessons.join(
        calls.tables.calls,
        calls.columns.calls("id"),
        this.columns.lessons("call_id")
      )
      .sum(column, { as: "total" });

    const filter: SearchFilter = { users, canceled, future };
    const builder = this.applySearchFilter(base, filter);
    const row: { total: NumericString } | undefined = await builder
      .first()
      .then();

    return row ? zod.coerce.number().parse(row.total) : 0;
  }

  async countLessons(params: Omit<AggregateParams, "column">) {
    const column = this.columns.lessons("id");
    return this.count({ ...params, column, distinct: true });
  }

  async count({
    tx,
    column,
    distinct = false,
    ...filter
  }: AggregateParams & { distinct?: boolean }) {
    const base = this.builder(tx).lessons.join(
      calls.tables.calls,
      calls.columns.calls("id"),
      this.columns.lessons("call_id")
    );
    return await countRows(this.applySearchFilter(base, filter), {
      column,
      distinct,
    });
  }

  /**
   * @param tutor tutor id
   * @param future include future lessons (default is `true`)
   * @param canceled include canceled lessons (default is `true`)
   */
  async countTutorStudents({
    canceled = true,
    future = true,
    tutor,
    tx,
  }: {
    tutor: number;
    future?: boolean;
    canceled?: boolean;
    tx?: Knex.Transaction;
  }) {
    /**
     * Query Example:
     *
     * ```sql
     *  SELECT COUNT(
     *          DISTINCT lesson_members.user_id
     *      ) as count
     *  FROM "lesson_members"
     *  WHERE
     *      lesson_members.lesson_id in (
     *          SELECT lessons.id
     *          FROM "lessons"
     *              JOIN "lesson_members" ON lesson_members.lesson_id = lessons.id
     *          WHERE
     *              lesson_members.user_id = 5
     *      )
     *      AND lesson_members.user_id != 5;
     * ```
     */
    const subquery: Knex.QueryBuilder<ILesson.Row> = this.applySearchFilter(
      this.builder(tx).lessons.select(this.columns.lessons("id")),
      { canceled, future, users: [tutor] }
    );

    const query = this.builder(tx)
      .lessons.join(
        this.table.members,
        this.columns.members("lesson_id"),
        this.columns.lessons("id")
      )
      .join(
        calls.tables.calls,
        calls.columns.calls("id"),
        this.columns.lessons("call_id")
      )
      .whereIn(this.columns.members("lesson_id"), subquery)
      .andWhere(this.columns.members("user_id"), "!=", tutor); // execlude the tutor

    const count: number = await countRows(query, {
      column: this.columns.members("user_id"),
      distinct: true,
    });

    return count;
  }

  /**
   * Return the days that the user had a lesson at and the lesson duration.
   *
   * @param user the user id
   * @param future flag to include or exclude future lessons
   * @param canceled flag to include or exclude canceled lessons
   */
  async findLessonDays({
    user,
    future,
    canceled,
    tx,
  }: {
    user: number;
    future?: boolean;
    canceled?: boolean;
    tx?: Knex.Transaction;
  }): Promise<ILesson.LessonDays> {
    const base = this.builder(tx)
      .lessons.join(
        calls.tables.calls,
        calls.columns.calls("id"),
        this.columns.lessons("call_id")
      )
      .select<ILesson.LessonDayRows>({
        start: calls.columns.calls("start"),
        duration: calls.columns.calls("duration"),
      });

    const query = this.applySearchFilter(base, {
      users: [user],
      future,
      canceled,
    });

    const rows = await query.then();
    return rows.map(({ start, duration }) => ({
      start: start.toISOString(),
      duration,
    }));
  }

  applySearchFilter<T>(
    builder: Knex.QueryBuilder<ILesson.Row, T>,
    { canceled = true, future = true, users }: SearchFilter
  ): Knex.QueryBuilder<ILesson.Row, T> {
    //! Because of the one-to-many relationship between the lesson and its
    //! members. We should only perform the join in case the `users` param is
    //! providered. We will get duplicated rows if we did this by default which
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

    return builder;
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
    return merge(omit(row, "createdAt", "updatedAt"), {
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  builder(tx?: Knex.Transaction): Builder {
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
