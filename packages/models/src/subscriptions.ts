import { ISubscription, Paginated } from "@litespace/types";
import {
  column,
  countRows,
  knex,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { first, isEmpty } from "lodash";
import { Knex } from "knex";
import dayjs from "dayjs";

export class Subscriptions {
  table = "subscriptions" as const;

  async create(
    payload: WithOptionalTx<ISubscription.CreatePayload>
  ): Promise<ISubscription.Self> {
    const now = new Date();
    const rows = await this.builder(payload.tx).insert(
      {
        user_id: payload.userId,
        plan_id: payload.planId,
        tx_id: payload.txId,
        period: payload.period,
        weekly_minutes: payload.weeklyMinutes,
        start: dayjs.utc(payload.start).toDate(),
        end: dayjs.utc(payload.end).toDate(),
        extended_by: null,
        created_at: now,
        updated_at: now,
      },
      "*"
    );
    const row = first(rows);
    if (!row) throw new Error("subscription not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: ISubscription.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<ISubscription.Self> {
    const now = new Date();
    const rows = await this.builder(tx)
      .update(
        {
          extended_by: payload.extendedBy,
          terminated_at:
            typeof payload.terminatedAt === "string"
              ? dayjs.utc(payload.terminatedAt).toDate()
              : payload.terminatedAt,
          updated_at: now,
        },
        "*"
      )
      .where(this.column("id"), id);

    const row = first(rows);
    if (!row) throw new Error("subscription not found; should never happen");
    return this.from(row);
  }

  async findById(id: number): Promise<ISubscription.Self | null> {
    const { list } = await this.find({ ids: [id] });
    return first(list) || null;
  }

  async find({
    tx,
    page,
    size,
    full,
    ...query
  }: WithOptionalTx<ISubscription.ModelFindQuery>): Promise<
    Paginated<ISubscription.Self>
  > {
    const base = this.applySearchFilter(this.builder(tx), query);
    const total = await countRows(base.clone(), { column: this.column("id") });
    const queryBuilder = base.clone().select();
    const rows = await withSkippablePagination(queryBuilder, {
      page,
      size,
      full,
    });
    return { list: rows.map((row) => this.from(row)), total };
  }

  async findByTxId(
    txId: number,
    tx?: Knex.Transaction
  ): Promise<ISubscription.Self | null> {
    const subscriptions = await this.find({ transactions: [txId], tx });
    const subscription = first(subscriptions.list);
    return subscription || null;
  }

  from(row: ISubscription.Row): ISubscription.Self {
    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      txId: row.tx_id,
      period: row.period,
      weeklyMinutes: row.weekly_minutes,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      extendedBy: row.extended_by,
      terminatedAt: row.terminated_at ? row.terminated_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  applySearchFilter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    {
      ids = [],
      users = [],
      plans = [],
      periods = [],
      transactions = [],
      terminated,
      weeklyMinutes,
      extended,
      start,
      end,
    }: ISubscription.ModelFindFilter
  ): Knex.QueryBuilder<R, T> {
    if (!isEmpty(users)) builder.whereIn(this.column("user_id"), users);

    if (!isEmpty(ids)) builder.whereIn(this.column("id"), ids);

    if (!isEmpty(plans)) builder.whereIn(this.column("plan_id"), plans);

    if (!isEmpty(periods)) builder.whereIn(this.column("period"), periods);

    if (!isEmpty(transactions))
      builder.whereIn(this.column("tx_id"), transactions);

    if (typeof terminated !== "undefined")
      builder.where(
        this.column("terminated_at"),
        terminated ? "IS NOT" : "IS",
        null
      );

    const exactWeeklyMinutesMatch = typeof weeklyMinutes === "number";

    if (exactWeeklyMinutesMatch)
      builder.where(this.column("weekly_minutes"), weeklyMinutes);

    if (weeklyMinutes && !exactWeeklyMinutesMatch && weeklyMinutes.gt)
      builder.where(this.column("weekly_minutes"), ">", weeklyMinutes.gt);

    if (weeklyMinutes && !exactWeeklyMinutesMatch && weeklyMinutes.gte)
      builder.where(this.column("weekly_minutes"), ">=", weeklyMinutes.gte);

    if (weeklyMinutes && !exactWeeklyMinutesMatch && weeklyMinutes.lt)
      builder.where(this.column("weekly_minutes"), "<", weeklyMinutes.lt);

    if (weeklyMinutes && !exactWeeklyMinutesMatch && weeklyMinutes.lte)
      builder.where(this.column("weekly_minutes"), "<=", weeklyMinutes.lte);

    if (extended === true) builder.whereNotNull(this.column("extended_by"));

    if (extended === false) builder.whereNull(this.column("extended_by"));

    if (start?.after) {
      builder.where(
        this.column("start"),
        ">=",
        dayjs.utc(start.after).toDate()
      );
    }

    if (start?.before)
      builder.where(
        this.column("start"),
        "<=",
        dayjs.utc(start.before).toDate()
      );

    if (end?.after)
      builder.where(this.column("end"), ">=", dayjs.utc(end.after).toDate());

    if (end?.before)
      builder.where(this.column("end"), "<=", dayjs.utc(end.before).toDate());

    return builder;
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<ISubscription.Row>(this.table)
      : knex<ISubscription.Row>(this.table);
  }

  column(value: keyof ISubscription.Row) {
    return column(value, this.table);
  }
}

export const subscriptions = new Subscriptions();
