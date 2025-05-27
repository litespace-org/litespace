import {
  IFilter,
  IInvoice,
  IWithdrawMethod,
  Paginated,
  banks,
} from "@litespace/types";
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

export const updateRequest = zod.object({
  method: zod.enum([
    IWithdrawMethod.Type.Wallet,
    IWithdrawMethod.Type.Bank,
    IWithdrawMethod.Type.Instapay,
  ]),
  receiver: zod.string(),
  bank: zod.union([zod.enum(banks), zod.null()]),
  amount: zod.coerce.number().int().positive(),
});

export class Invoices {
  readonly table = "invoices" as const;

  readonly columns: Record<keyof IInvoice.Row, string> = {
    id: this.column("id"),
    user_id: this.column("user_id"),
    method: this.column("method"),
    receiver: this.column("receiver"),
    bank: this.column("bank"),
    amount: this.column("amount"),
    update: this.column("update"),
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
        bank: payload.bank,
        amount: payload.amount,
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
  ): Promise<IInvoice.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .update({
        update: payload.updateRequest
          ? JSON.stringify(payload.updateRequest)
          : null,
        method: payload.method,
        receiver: payload.receiver,
        bank: payload.bank,
        amount: payload.amount,
        status: payload.status,
        note: payload.note,
        receipt: payload.receipt,
        addressed_by: payload.addressedBy,
        updated_at: now,
      })
      .where(this.column("id"), id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("Invoice not found; should never happen");
    return this.from(row);
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
    pending = true,
    users,
    tx,
  }: {
    users?: number[];
    pending?: boolean;
    tx?: Knex.Transaction;
  }): Promise<number> {
    const status: IInvoice.Status[] = [IInvoice.Status.Fulfilled];
    if (pending) status.push(IInvoice.Status.Pending);

    const builder = this.builder(tx)
      .sum<{ amount: string }>(this.column("amount"), { as: "amount" })
      .whereIn(this.column("status"), status);

    if (users) builder.whereIn(this.column("user_id"), users);

    const row = await builder.first();
    return row ? zod.coerce.number().parse(row.amount) : 0;
  }

  async find({
    users,
    methods,
    banks,
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

    if (banks && !isEmpty(banks)) builder.whereIn(this.column("bank"), banks);

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
    const update: IInvoice.Self["update"] =
      row.update !== null ? updateRequest.parse(row.update) : null;

    return {
      id: row.id,
      userId: row.user_id,
      method: row.method,
      receiver: row.receiver,
      bank: row.bank,
      amount: row.amount,
      update,
      status: row.status,
      note: row.note,
      receipt: row.receipt,
      addressedBy: row.addressed_by,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.created_at.toISOString(),
    };
  }
}

export const invoices = new Invoices();
