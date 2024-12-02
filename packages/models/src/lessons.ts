import {
  ICall,
  IFilter,
  ILesson,
  NumericString,
  Paginated,
} from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { concat, first, isEmpty, merge, omit, orderBy } from "lodash";
import { users } from "@/users";
import {
  aggArrayOrder,
  knex,
  column,
  addSqlMinutes,
  countRows,
  WithOptionalTx,
  WithTx,
  withSkippablePagination,
} from "@/query";
import { calls } from "@/calls";
import zod from "zod";

type SearchFilter = {
  /**
   * User ids to be included in the search query.
   */
  users?: number[];
  canceled?: boolean;
  ratified?: boolean;
  /**
   * @deprecated use `after` instead
   */
  future?: boolean;
  /**
   * @deprecated use `before` instead
   */
  past?: boolean;
  /**
   * @deprecated use `before` and `after` instead
   */
  now?: boolean;
  /**
   * Start date time (ISO datetime format)
   *
   * All lessons after (or the same as) this date will be included.
   */
  after?: string;
  /**
   * End date time (ISO datetime format)
   *
   * All lessons before (or the same as) this date will be included.
   */
  before?: string;
  /**
   * Filter only lessons that blogs to the provided rule ids.
   */
  rules?: number[];
};

type BaseAggregateParams = SearchFilter & { tx?: Knex.Transaction };

type AggregateParams = BaseAggregateParams & { column: string };

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
      start: this.columns.lessons("start"),
      duration: this.columns.lessons("duration"),
      price: this.columns.lessons("price"),
      rule_id: this.columns.lessons("rule_id"),
      call_id: this.columns.lessons("call_id"),
      canceled_by: this.columns.lessons("canceled_by"),
      canceled_at: this.columns.lessons("canceled_at"),
      created_at: this.columns.lessons("created_at"),
      updated_at: this.columns.lessons("updated_at"),
    },
  } as const;

  async create({ tx, ...payload }: WithTx<ILesson.CreatePayload>): Promise<{
    lesson: ILesson.Self;
    members: ILesson.Member[];
  }> {
    const now = dayjs.utc().toDate();
    const builder = this.builder(tx);

    const lessons = await builder.lessons
      .insert({
        start: dayjs.utc(payload.start).toDate(),
        duration: payload.duration,
        rule_id: payload.rule,
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
        concat(payload.tutor, payload.student).map((userId) => ({
          user_id: userId,
          lesson_id: lesson.id,
        }))
      )
      .returning("*");

    return {
      lesson,
      members: members.map((member) => this.asMember(member)),
    };
  }

  async cancel({
    canceledBy,
    id,
    tx,
  }: WithOptionalTx<{
    id: number;
    canceledBy: number;
  }>): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .lessons.update({
        canceled_by: canceledBy,
        canceled_at: now,
        updated_at: now,
      })
      .where(this.columns.lessons("id"), id);
  }

  async findById({
    id,
    tx,
  }: WithOptionalTx<{ id: number }>): Promise<ILesson.Self | null> {
    const rows = await this.builder(tx)
      .lessons.select("*")
      .where(this.columns.lessons("id"), id);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findLessonMembers(
    lessonIds: number[],
    tx?: Knex.Transaction
  ): Promise<ILesson.PopuldatedMember[]> {
    const select: Record<keyof ILesson.PopuldatedMemberRow, string> = {
      user_id: users.column("id"),
      lesson_id: this.columns.members("lesson_id"),
      name: users.column("name"),
      image: users.column("image"),
      role: users.column("role"),
    };

    const rows: ILesson.PopuldatedMemberRow[] = await users
      .builder(tx)
      .select<ILesson.PopuldatedMemberRow[]>(select)
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

  /**
   * @typedef {SearchFilter} Payload
   * @typedef {IFilter.SkippablePagination}
   */
  async find({
    tx,
    users,
    ratified = true,
    canceled = true,
    future = true,
    past = true,
    now = false,
    after,
    before,
    rules,
    ...pagination
  }: WithOptionalTx<IFilter.SkippablePagination & SearchFilter>): Promise<
    Paginated<ILesson.Self>
  > {
    const baseBuilder = this.applySearchFilter(this.builder(tx).lessons, {
      users,
      canceled,
      ratified,
      future,
      past,
      now,
      after,
      before,
    });

    const total = await countRows(baseBuilder.clone(), {
      column: this.columns.lessons("id"),
    });

    const queryBuilder = baseBuilder
      .clone()
      .select(this.rows.lesson)
      .orderBy(this.columns.lessons("start"), "desc");

    const rows = await withSkippablePagination(queryBuilder, pagination);
    return { list: rows.map((row) => this.from(row)), total };
  }

  async sumPrice(params: BaseAggregateParams): Promise<number> {
    const column = this.columns.lessons("price");
    return await this.sum({ ...params, column });
  }

  async sumDuration(params: BaseAggregateParams) {
    const column = this.columns.lessons("duration");
    return await this.sum({ ...params, column });
  }

  async sum({
    ratified = true,
    canceled = true,
    future = true,
    past = true,
    after,
    before,
    column,
    users,
    tx,
  }: AggregateParams) {
    const base = this.builder(tx)
      .lessons.join(
        calls.tables.calls,
        calls.columns.calls("id"),
        this.columns.lessons("call_id")
      )
      .sum(column, { as: "total" });

    const filter: SearchFilter = {
      users,
      canceled,
      ratified,
      future,
      past,
      after,
      before,
    };
    const builder = this.applySearchFilter(base, filter);
    const row: { total: NumericString } | undefined = await builder
      .first()
      .then();

    return row ? zod.coerce.number().parse(row.total) : 0;
  }

  async countLessons(params: BaseAggregateParams) {
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

    const countQueryBuilder = this.applySearchFilter(base, filter);
    return await countRows(countQueryBuilder, { column, distinct });
  }

  async countCounterpartMembers({
    tx,
    user,
    ...filter
  }: {
    user: number;
    tx?: Knex.Transaction;
  } & Omit<SearchFilter, "users">) {
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
    const subqueryBaseBuilder = this.builder(tx)
      .lessons.select(this.columns.lessons("id"))
      .join(
        this.table.members,
        this.columns.members("lesson_id"),
        this.columns.lessons("id")
      )
      .where(this.columns.members("user_id"), user);

    const baseQueryBuilder = this.builder(tx)
      .members.join(
        this.table.lessons,
        this.columns.lessons("id"),
        this.columns.members("lesson_id")
      )
      .whereIn(this.columns.members("lesson_id"), subqueryBaseBuilder)
      .andWhere(this.columns.members("user_id"), "!=", user); // execlude the user

    const queryBuilder = this.applySearchFilter(baseQueryBuilder, filter);

    const count: number = await countRows(queryBuilder, {
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
    tx,
    ...filter
  }: SearchFilter & {
    tx?: Knex.Transaction;
  }): Promise<ILesson.LessonDays> {
    const baseBuilder = this.builder(tx).lessons.select<ILesson.LessonDayRows>({
      start: this.columns.lessons("start"),
      duration: this.columns.lessons("duration"),
    });

    const rows = await this.applySearchFilter(baseBuilder, filter);

    return rows.map(({ start, duration }) => ({
      start: start.toISOString(),
      duration,
    }));
  }

  applySearchFilter<T>(
    builder: Knex.QueryBuilder<ILesson.Row, T>,
    {
      canceled = true,
      future = true,
      ratified = true,
      past = true,
      now = false,
      users,
      after,
      before,
      rules = [],
    }: SearchFilter
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

    const canceledOnly = canceled && !ratified;
    const ratifiedOnly = ratified && !canceled;

    if (canceledOnly)
      builder.where(this.columns.lessons("canceled_by"), "IS NOT", null);

    if (ratifiedOnly)
      builder.where(this.columns.lessons("canceled_by"), "IS", null);

    const futureOnly = future && !past;
    const pastOnly = past && !future;

    const nowDate = dayjs.utc().toDate();
    const end = addSqlMinutes(
      this.columns.lessons("start"),
      this.columns.lessons("duration")
    );

    if (now) {
      builder
        .where(this.columns.lessons("start"), ">=", nowDate)
        .andWhere(end, "<=", nowDate);
    } else if (futureOnly) {
      builder.where(this.columns.lessons("start"), ">=", nowDate);
    } else if (pastOnly) {
      builder.where(end, "<=", nowDate);
    }

    if (after) builder.where(end, ">=", dayjs.utc(after).toDate());
    if (before) builder.where(end, "<=", dayjs.utc(before).toDate());

    if (!isEmpty(rules))
      builder.whereIn(this.columns.lessons("rule_id"), rules);

    return builder;
  }

  from(row: ILesson.Row): ILesson.Self {
    return {
      id: row.id,
      start: row.start.toISOString(),
      duration: row.duration,
      price: row.price,
      ruleId: row.rule_id,
      callId: row.call_id,
      canceledBy: row.canceled_by,
      canceledAt: row.canceled_at ? row.canceled_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asMember(row: ILesson.MemberRow): ILesson.Member {
    return { userId: row.user_id, lessonId: row.lesson_id };
  }

  asPopulatedMember(
    row: ILesson.PopuldatedMemberRow
  ): ILesson.PopuldatedMember {
    return {
      lessonId: row.lesson_id,
      userId: row.user_id,
      name: row.name,
      image: row.image,
      role: row.role,
    };
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
