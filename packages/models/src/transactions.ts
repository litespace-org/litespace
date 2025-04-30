import { ITransaction, Paginated } from "@litespace/types";
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

export class Transactions {
  table = "transactions" as const;

  async create(
    payload: ITransaction.CreatePayload
  ): Promise<ITransaction.Self> {
    const now = new Date();
    const rows = await this.builder().insert(
      {
        user_id: payload.userId,
        plan_id: payload.planId,
        plan_period: payload.planPeriod,
        amount: payload.amount,
        status: ITransaction.Status.New,
        payment_method: payload.paymentMethod,
        provider_ref_num: payload.providerRefNum,
        created_at: now,
        updated_at: now,
      },
      "*"
    );
    const row = first(rows);
    if (!row) throw new Error("Transaction not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: ITransaction.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<ITransaction.Self> {
    const rows = await this.builder(tx)
      .update(
        {
          status: payload.status,
          provider_ref_num: payload.providerRefNum,
        },
        "*"
      )
      .where(this.column("id"), id);

    const row = first(rows);
    if (!row) throw new Error("Transaction not found; should never happen");

    return this.from(row);
  }

  async findById(id: number): Promise<ITransaction.Self | null> {
    const { list } = await this.find({ ids: [id] });
    return first(list) || null;
  }

  async find({
    tx,
    page,
    size,
    ...query
  }: WithOptionalTx<ITransaction.FindQueryModel>): Promise<
    Paginated<ITransaction.Self>
  > {
    const base = this.applySearchFilter(this.builder(tx), query);
    const total = await countRows(base.clone(), { column: this.column("id") });
    const queryBuilder = base.clone().select();
    const rows = await withSkippablePagination(queryBuilder, { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  from(row: ITransaction.Row): ITransaction.Self {
    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      planPeriod: row.plan_period,
      amount: row.amount,
      status: row.status,
      paymentMethod: row.payment_method,
      providerRefNum: row.provider_ref_num,
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
      planPeriods = [],
      amount,
      statuses = [],
      paymentMethods = [],
      providerRefNums = [],
      after,
      before,
    }: ITransaction.FindFilterModel
  ): Knex.QueryBuilder<R, T> {
    if (!isEmpty(ids)) builder.whereIn(this.column("id"), ids);

    if (!isEmpty(users)) builder.whereIn(this.column("user_id"), users);

    if (!isEmpty(plans)) builder.whereIn(this.column("plan_id"), plans);

    if (!isEmpty(planPeriods))
      builder.whereIn(this.column("plan_period"), planPeriods);

    if (typeof amount === "number")
      builder.where(this.column("amount"), amount);

    if (!isEmpty(statuses)) builder.whereIn(this.column("status"), statuses);

    if (!isEmpty(paymentMethods))
      builder.whereIn(this.column("payment_method"), paymentMethods);

    if (!isEmpty(providerRefNums)) {
      const refNums = providerRefNums.filter((ref) => ref !== null);
      const includeNull = providerRefNums.includes(null);

      builder.where((builder) => {
        builder.whereIn(this.column("provider_ref_num"), refNums);
        if (includeNull)
          builder.orWhere(this.column("provider_ref_num"), "IS", null);
      });
    }

    if (after)
      builder.where(this.column("created_at"), ">=", dayjs.utc(after).toDate());

    if (before)
      builder.where(
        this.column("created_at"),
        "<=",
        dayjs.utc(before).toDate()
      );

    return builder;
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<ITransaction.Row>(this.table)
      : knex<ITransaction.Row>(this.table);
  }

  column(value: keyof ITransaction.Row) {
    return column(value, this.table);
  }
}

export const transactions = new Transactions();
