import { ITransaction, Paginated } from "@litespace/types";
import {
  countRows,
  withDateFilter,
  withListFilter,
  withNullableListFilter,
  withNumericFilter,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { first } from "lodash";
import { Knex } from "knex";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  userId: "user_id",
  amount: "amount",
  status: "status",
  type: "type",
  fees: "fees",
  phone: "phone",
  paymentMethod: "payment_method",
  providerRefNum: "provider_ref_num",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<ITransaction.Field, ITransaction.Column>;

export class Transactions extends Model<
  ITransaction.Row,
  ITransaction.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "transactions",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create({
    tx,
    ...payload
  }: WithOptionalTx<ITransaction.CreatePayload>): Promise<ITransaction.Self> {
    const now = new Date();
    const rows = await this.builder(tx).insert(
      {
        user_id: payload.userId,
        amount: payload.amount,
        type: payload.type,
        status: payload.status || ITransaction.Status.New,
        fees: payload.fees,
        phone: payload.phone,
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

  async update({
    tx,
    id,
    ...payload
  }: WithOptionalTx<ITransaction.UpdateModelPayload>): Promise<ITransaction.Self> {
    const rows = await this.builder(tx)
      .update(
        {
          status: payload.status,
          fees: payload.fees,
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

  async findOne(
    payload: WithOptionalTx<ITransaction.FindQueryModel>
  ): Promise<ITransaction.Self | null> {
    const { list } = await this.find(payload);
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
    const base = this.filter(this.builder(tx), query);
    const total = await countRows(base.clone(), { column: this.column("id") });
    const queryBuilder = base
      .clone()
      .select()
      .orderBy(this.column("created_at"), "desc");
    const rows = await withSkippablePagination(queryBuilder, { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  filter<R extends object, T>(
    builder: Knex.QueryBuilder<R, T>,
    {
      ids,
      users,
      types,
      amount,
      statuses,
      paymentMethods,
      providerRefNums,
      createdAt,
      updatedAt,
    }: ITransaction.FindFilterModel
  ): Knex.QueryBuilder<R, T> {
    withListFilter(builder, this.column("id"), ids);
    withListFilter(builder, this.column("user_id"), users);
    withNumericFilter(builder, this.column("amount"), amount);
    withListFilter(builder, this.column("status"), statuses);
    withListFilter(builder, this.column("type"), types);
    withListFilter(builder, this.column("payment_method"), paymentMethods);
    withNullableListFilter(
      builder,
      this.column("provider_ref_num"),
      providerRefNums
    );
    withDateFilter(builder, this.column("created_at"), createdAt);
    withDateFilter(builder, this.column("updated_at"), updatedAt);
    return builder;
  }
}

export const transactions = new Transactions();
