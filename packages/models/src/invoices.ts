import { IFilter, IInvoice, Paginated } from "@litespace/types";
import {
  column,
  countRows,
  knex,
  WithOptionalTx,
  withPagination,
} from "@/query";
import { Knex } from "knex";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import { first, isEmpty, isUndefined } from "lodash";

export class Invoices {
  readonly table = "invoices" as const;

  readonly columns: Record<keyof IInvoice.Row, string> = {
    id: this.column("id"),
    user_id: this.column("user_id"),
    method: this.column("method"),
    receiver: this.column("receiver"),
    amount: this.column("amount"),
    status: this.column("status"),
    note: this.column("note"),
    receipt: this.column("receipt"),
    addressed_by: this.column("addressed_by"),
    created_at: this.column("created_at"),
    updated_at: this.column("updated_at"),
  } as const;

  async create(
    payload: IInvoice.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<IInvoice.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        user_id: payload.userId,
        method: payload.method,
        receiver: payload.receiver,
        amount: payload.amount,
        note: payload.note,
        status: IInvoice.Status.PendingApproval,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Invoice not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IInvoice.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(tx)
      .update({
        status: payload.status,
        receipt: payload.receipt,
        addressed_by: payload.addressedBy,
        note: payload.note,
        updated_at: now,
      })
      .where(this.column("id"), id);
  }

  async findByUser(
    userId: number,
    pagination?: IFilter.Pagination,
    tx?: Knex.Transaction
  ): Promise<Paginated<IInvoice.Self>> {
    const builder = this.builder(tx).where(this.column("user_id"), userId);
    const total = await countRows(builder.clone());
    const query = builder
      .clone()
      .select(this.columns)
      .orderBy(this.column("created_at"), "desc");
    const rows = await withPagination(query, pagination);
    return { list: rows.map((row) => this.from(row)), total };
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IInvoice.Self | null> {
    const rows = await this.builder(tx)
      .select(this.columns)
      .where(this.column("id"), id);

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async sumAmounts({
    status,
    users,
    tx,
  }: {
    users?: number[];
    status?: IInvoice.Status[];
    tx?: Knex.Transaction;
  }): Promise<number> {
    const builder = this.builder(tx).sum<{ amount: string }>(
      this.column("amount"),
      { as: "amount" }
    );

    if (status) builder.whereIn(this.column("status"), status);

    if (users) builder.whereIn(this.column("user_id"), users);

    const row = await builder.first();
    return row ? zod.coerce.number().parse(row.amount) : 0;
  }

  async find({
    users,
    methods,
    statuses,
    receipt,
    page,
    size,
    tx,
  }: WithOptionalTx<IInvoice.FindInvoicesQuery>): Promise<
    Paginated<IInvoice.Self>
  > {
    const builder = this.builder(tx);

    if (users && !isEmpty(users))
      builder.whereIn(this.column("user_id"), users);

    if (methods && !isEmpty(methods))
      builder.whereIn(this.column("method"), methods);

    if (statuses && !isEmpty(statuses))
      builder.whereIn(this.column("status"), statuses);

    if (!isUndefined(receipt))
      builder.where(this.column("receipt"), receipt ? "IS NOT" : "IS", null);

    const total = await countRows(builder.clone());
    const query = builder
      .clone()
      .select(this.columns)
      .orderBy(this.column("created_at"), "desc");

    const rows = await withPagination(query, { page, size });
    return { list: rows.map((row) => this.from(row)), total };
  }

  builder(
    tx?: Knex.Transaction
  ): Knex.QueryBuilder<IInvoice.Row, IInvoice.Row[]> {
    return tx ? tx(this.table) : knex(this.table);
  }

  column(value: keyof IInvoice.Row): string {
    return column(value, this.table);
  }

  from(row: IInvoice.Row): IInvoice.Self {
    return {
      id: row.id,
      userId: row.user_id,
      method: row.method,
      receiver: row.receiver,
      amount: row.amount,
      status: row.status,
      note: row.note,
      receipt: row.receipt,
      addressedBy: row.addressed_by,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const invoices = new Invoices();
