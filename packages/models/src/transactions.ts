import { ITransaction, Paginated } from "@litespace/types";
import { column, countRows, knex, withSkippablePagination } from "@/query";
import { first, isEmpty } from "lodash";
import { Knex } from "knex";
import dayjs from "dayjs";

export class Transactions {
  table = "transactions" as const;

  columns = (value: keyof ITransaction.Row) => column(value, this.table);

  async create(
    payload: ITransaction.CreatePayload
  ): Promise<ITransaction.Self> {
    const now = new Date();
    const rows = await this.builder().insert(
      {
        user_id: payload.userId,
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
    payload: ITransaction.UpdatePayload
  ): Promise<ITransaction.Self> {
    const rows = await this.builder()
      .update(
        {
          status: payload.status,
          provider_ref_num: payload.providerRefNum,
        },
        "*"
      )
      .where("id", id);

    const row = first(rows);
    if (!row) throw new Error("Transaction not found; should never happen");

    return this.from(row);
  }

  async findById(id: number): Promise<ITransaction.Self | null> {
    const { list } = await this.find({ id });
    return first(list) || null;
  }

  async find({
    tx,
    id,
    users,
    amount,
    status,
    paymentMethod,
    providerRefNum,
    page,
    size,
  }: ITransaction.FindQuery & { tx?: Knex.Transaction }): Promise<
    Paginated<ITransaction.Self>
  > {
    const baseBuilder = this.applySearchFilter(this.builder(tx), {
      id,
      users,
      amount,
      status,
      paymentMethod,
      providerRefNum,
    });
    const total = await countRows(baseBuilder.clone(), {
      column: this.columns("id"),
    });
    const queryBuilder = baseBuilder.clone().select();
    const rows = await withSkippablePagination(queryBuilder, { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  from(row: ITransaction.Row): ITransaction.Self {
    return {
      id: row.id,
      userId: row.user_id,
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
      id,
      users,
      amount,
      status,
      paymentMethod,
      providerRefNum,
      after,
      before,
    }: ITransaction.FindQuery
  ): Knex.QueryBuilder<R, T> {
    if (users && !isEmpty(users))
      builder.whereIn(this.columns("user_id"), users);

    if (id) builder.where(this.columns("id"), id);
    if (amount) builder.where(this.columns("amount"), amount);
    if (status) builder.where(this.columns("status"), status);

    if (paymentMethod)
      builder.where(this.columns("payment_method"), paymentMethod);

    if (providerRefNum)
      builder.where(this.columns("provider_ref_num"), providerRefNum);

    if (after)
      builder.where(
        this.columns("created_at"),
        ">=",
        dayjs.utc(after).toDate()
      );

    if (before)
      builder.where(
        this.columns("created_at"),
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
}

export const transactions = new Transactions();
