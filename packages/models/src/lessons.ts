import {
  IFilter,
  ILesson,
  ISession,
  NumericString,
  Paginated,
} from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { concat, first, isEmpty } from "lodash";
import { users } from "@/users";
import {
  knex,
  column,
  addSqlMinutes,
  countRows,
  WithOptionalTx,
  WithTx,
  withSkippablePagination,
} from "@/query";
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
   * When provided with the `before` or `after` flag, it will not
   * include lessons that are partially out the query time boundaries.
   * @default false
   */
  strict?: boolean;
  /**
   * Filter only lessons that blogs to the provided slot ids.
   */
  slots?: number[];
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
      slot_id: this.columns.lessons("slot_id"),
      session_id: this.columns.lessons("session_id"),
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
        slot_id: payload.slot,
        session_id: payload.session,
        price: payload.price,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const lesson = first(lessons.map((lesson) => this.from(lesson)));
    /* c8 ignore next */
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

  async update(
    id: number,
    payload: ILesson.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<ILesson.Self> {
    const rows = await this.builder(tx)
      .lessons.update({
        slot_id: payload.slotId,
        start: payload.start ? dayjs.utc(payload.start).toDate() : undefined,
        duration: payload.duration,
        updated_at: dayjs.utc().toDate(),
      })
      .where("id", id)
      .returning("*");

    const row = first(rows);
    /* c8 ignore next */
    if (!row) throw new Error("Lesson not found; should never happen");
    return this.from(row);
  }

  async cancel({
    canceledBy,
    ids,
    tx,
  }: WithOptionalTx<{
    ids: number[];
    canceledBy: number;
  }>): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .lessons.update({
        canceled_by: canceledBy,
        canceled_at: now,
        updated_at: now,
      })
      .whereIn(this.columns.lessons("id"), ids);
  }

  private async findOneBy<T extends keyof ILesson.Row>(
    key: T,
    value: ILesson.Row[T]
  ): Promise<ILesson.Self | null> {
    const lessons = await this.findManyBy(key, value);
    return first(lessons) || null;
  }

  private async findManyBy<T extends keyof ILesson.Row>(
    key: T,
    value: ILesson.Row[T]
  ): Promise<ILesson.Self[]> {
    const rows = await knex<ILesson.Row>(this.table)
      .select("*")
      .where(key, value);
    return rows.map((row) => this.from(row));
  }

  async findBySessionId(id: ISession.Id): Promise<ILesson.Self | null> {
    return await this.findOneBy("session_id", id);
  }

  async findById(id: number): Promise<ILesson.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findLessonMembers(
    lessonIds: number[],
    tx?: Knex.Transaction
  ): Promise<ILesson.PopulatedMember[]> {
    const select: Record<keyof ILesson.PopulatedMemberRow, string> = {
      user_id: users.column("id"),
      lesson_id: this.columns.members("lesson_id"),
      name: users.column("name"),
      image: users.column("image"),
      role: users.column("role"),
      phone: users.column("phone"),
      notification_method: users.column("notification_method"),
      verified_phone: users.column("verified_phone"),
    };

    const rows: ILesson.PopulatedMemberRow[] = await users
      .builder(tx)
      .select<ILesson.PopulatedMemberRow[]>(select)
      .join(
        this.table.members,
        this.columns.members("user_id"),
        users.column("id")
      )
      .whereIn(this.columns.members("lesson_id"), lessonIds);

    return rows.map((row) => this.asPopulatedMember(row));
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
    after,
    before,
    slots,
    strict,
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
      after,
      before,
      slots,
      strict,
    });

    const total = await countRows(baseBuilder.clone(), {
      column: this.columns.lessons("id"),
    });

    const queryBuilder = baseBuilder
      .clone()
      .select(this.rows.lesson)
      .orderBy(this.columns.lessons("start"), "asc");

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
    const base = this.builder(tx).lessons.sum(column, { as: "total" });

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

    /* c8 ignore next */
    if (!row) return 0;

    return zod.coerce.number().parse(row.total);
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
    const base = this.builder(tx).lessons;

    const countQueryBuilder = this.applySearchFilter(base, filter);
    return await countRows(countQueryBuilder, { column, distinct });
  }

  async countLessonsBatch({
    tx,
    users: userIds,
    ...filter
  }: {
    tx?: Knex.Transaction;
    users: number[];
  } & Omit<SearchFilter, "users">): Promise<
    Array<{ userId: number; count: number }>
  > {
    const query = this.builder(tx)
      .lessons.select({ user_id: this.columns.members("user_id") })
      .count<Array<{ user_id: number; count: number }>>("lesson_id", {
        as: "count",
      })
      .join(
        this.table.members,
        this.columns.members("lesson_id"),
        this.columns.lessons("id")
      )
      .whereIn(this.columns.members("user_id"), userIds);

    const filtered = this.applySearchFilter(query.clone(), filter);
    const rows = await filtered.groupBy("user_id");

    return rows.map((row) => ({
      userId: row.user_id,
      count: Number(row.count),
    }));
  }

  async countCounterpartMembersBatch({
    tx,
    users: userIds,
    ...filter
  }: {
    users: number[];
    tx?: Knex.Transaction;
  } & Omit<SearchFilter, "users">): Promise<
    Array<{ userId: number; count: number }>
  > {
    /**
     * Query Example:
     *
     * ```sql
     * SELECT
     *     user_id,
     *     COUNT(*) as count
     * FROM
     *    (
     *        SELECT DISTINCT
     *            lm.user_id as user_id,
     *            lm2.user_id as other_member
     *        FROM
     *            users
     *            JOIN lesson_members lm ON lm.user_id = users.id
     *            JOIN lesson_members lm2 ON lm2.lesson_id = lm.lesson_id
     *        WHERE
     *            lm.user_id != lm2.user_id
     *    )
     * GROUP BY
     *    user_id;
     * ```
     */

    const query = users
      .builder(tx)
      .select({ user_id: "lm.user_id", other_member: "lm2.user_id" })
      .distinct()
      .joinRaw(`JOIN lesson_members lm ON lm.user_id = users.id`)
      .joinRaw(`JOIN lesson_members lm2 ON lm2.lesson_id = lm.lesson_id`)
      .joinRaw(`JOIN lessons ON lessons.id = lm.lesson_id`)
      .whereNot("lm.user_id", "=", knex.ref("lm2.user_id"))
      .whereIn("lm.user_id", userIds);

    const filtered = this.applySearchFilter(query.clone(), filter);

    const rows = await knex
      .select("user_id")
      .count<Array<{ user_id: number; count: NumericString }>>("*", {
        as: "count",
      })
      .from(filtered)
      .groupBy("user_id");

    return userIds.map((userId) => {
      const count = rows.find((row) => row.user_id === userId)?.count || 0;

      return {
        userId,
        count: Number(count),
      };
    });
  }

  async countCounterpartMembers({
    user,
    ...params
  }: {
    user: number;
    tx?: Knex.Transaction;
  } & Omit<SearchFilter, "users">): Promise<number> {
    const result = await this.countCounterpartMembersBatch({
      users: [user],
      ...params,
    });
    return first(result)?.count || 0;
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

  applySearchFilter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    {
      users,
      ratified = true,
      canceled = true,
      future = true,
      past = true,
      strict = false,
      after,
      before,
      slots = [],
    }: SearchFilter
  ): Knex.QueryBuilder<R, T> {
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
    const start = this.columns.lessons("start");
    const end = addSqlMinutes(start, this.columns.lessons("duration"));

    if (futureOnly) {
      builder.where(this.columns.lessons("start"), ">=", nowDate);
    } else if (pastOnly) {
      builder.where(end, "<=", nowDate);
    }

    if (after)
      builder.where((builder) => {
        builder.where(start, ">=", dayjs.utc(after).toDate());
        if (!strict) builder.orWhere(end, ">", dayjs.utc(after).toDate());
      });

    if (before)
      builder.where((builder) => {
        builder.where(end, "<=", dayjs.utc(before).toDate());
        if (!strict) builder.orWhere(start, "<", dayjs.utc(before).toDate());
      });

    if (!isEmpty(slots))
      builder.whereIn(this.columns.lessons("slot_id"), slots);

    return builder;
  }

  from(row: ILesson.Row): ILesson.Self {
    return {
      id: row.id,
      start: row.start.toISOString(),
      duration: row.duration,
      price: row.price,
      slotId: row.slot_id,
      sessionId: row.session_id,
      canceledBy: row.canceled_by,
      canceledAt: row.canceled_at ? row.canceled_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  asMember(row: ILesson.MemberRow): ILesson.Member {
    return { userId: row.user_id, lessonId: row.lesson_id };
  }

  asPopulatedMember(row: ILesson.PopulatedMemberRow): ILesson.PopulatedMember {
    return {
      lessonId: row.lesson_id,
      userId: row.user_id,
      name: row.name,
      image: row.image,
      role: row.role,
      phone: row.phone,
      verifiedPhone: row.verified_phone,
      notificationMethod: row.notification_method,
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
