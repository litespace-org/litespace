import { Pool } from "pg";
import { IFilter, NumericString } from "@litespace/types";
import init, { Knex } from "knex";
import zod from "zod";

export type WithOptionalTx<T> = T & { tx?: Knex.Transaction };

const connection = {
  user: zod.string({ message: "Missing PG_USER" }).parse(process.env.PG_USER),
  password: zod
    .string({ message: "Missing PG_PASSWORD" })
    .parse(process.env.PG_PASSWORD),
  host: zod.string({ message: "Missing PG_HOST" }).parse(process.env.PG_HOST),
  port: zod.coerce
    .number({ message: "Missing PG_PORT" })
    .parse(process.env.PG_PORT),
  database: zod
    .string({ message: "Missing PG_DATABASE" })
    .parse(process.env.PG_DATABASE),
} as const;

export const pool = new Pool(connection);
export const knex = init({ client: "pg", connection });

function asSqlString<T extends { toString(): string }>(value: T): string {
  return `'${value.toString()}'`;
}

function asSqlColumn<T extends { toString(): string }>(value: T): string {
  const wrap = (value: string) => `"${value}"`;
  const [first, second] = value.toString().split(".");
  if (!second) return wrap(first);
  return [wrap(first), wrap(second)].join(".");
}

function asSearchTerm(term: string, match: IFilter.Match): string {
  if (match === IFilter.Match.Loose) return `%${term}%`;
  if (match === IFilter.Match.Suffix) return `%${term}`;
  if (match === IFilter.Match.Prefix) return `${term}%`;
  return term;
}

export function withFilter<T extends Knex.QueryBuilder>({
  builder,
  filter,
  defaults,
}: {
  builder: T;
  filter?: IFilter.Self;
  defaults?: {
    limit?: number;
    order?: IFilter.OrderDirection;
    search?: {
      columns?: Array<string | number | symbol>;
      sensitive?: boolean;
      match?: IFilter.Match;
    };
  };
}): T {
  // pagination
  const page = filter?.page || 1;
  const limit = filter?.size || defaults?.limit || 10;
  const offset = limit * (page - 1);
  builder.offset(offset).limit(limit);

  if (filter?.order) {
    const defs = filter.order?.map((column, index) => {
      const direction =
        filter.direction?.[index] ||
        defaults?.order ||
        IFilter.OrderDirection.Ascending;
      return { column, order: direction };
    });

    builder.orderBy(defs);
  }

  if (filter?.search) {
    const columns = filter.columns || defaults?.search?.columns || [];
    const sensitive = filter.sensitive || defaults?.search?.sensitive || false;
    const match =
      filter.match || defaults?.search?.match || IFilter.Match.Loose;

    for (const column of columns) {
      const term = asSqlString(asSearchTerm(filter.search, match));
      const col = asSqlColumn(column);
      /**
       * We cannot use `LIKE` or `ILIKE` on enum based columns. When peforming
       * text-search, we should cast all columns to `TEXT`.
       */
      if (sensitive) builder.orWhereRaw(`${col} :: TEXT LIKE ${term}`);
      else builder.orWhereRaw(`${col} :: TEXT ILIKE ${term}`);
    }
  }

  return builder;
}

export function withPagination<Row extends object, Result = Row[]>(
  builder: Knex.QueryBuilder<Row, Result>,
  pagination: IFilter.Pagination = {}
): Knex.QueryBuilder<Row, Result> {
  const page = pagination.page || 1;
  const size = pagination.size || 10;
  const offset = size * (page - 1);
  builder.offset(offset).limit(size);
  return builder;
}

export async function count(table: string): Promise<number> {
  const { count } = await knex(table)
    .count("id AS count")
    .first<{ count: string }>();
  return zod.coerce.number().parse(count);
}

export async function countRows<T extends Knex.QueryBuilder>(
  builder: T,
  options?: {
    column?: string;
    distinct?: boolean;
  }
): Promise<number> {
  // apply options
  if (options?.column && options.distinct)
    builder.countDistinct(options.column);
  else if (options?.column) builder.count({ count: options.column });
  else builder.count();

  const row: { count: NumericString } = await builder.first();
  return row ? zod.coerce.number().parse(row.count) : 0;
}

export function column<T>(value: keyof T, table: string | null = null): string {
  if (!table) return value.toString();
  return `${table}.${value.toString()}`;
}

export function aggArrayOrder(column: string) {
  return `array_agg(${column} order by ${column}) = ?` as const;
}

function asSqlInterval<Row extends object>(
  value: number | string,
  unit: string
): Knex.Raw<Row> {
  return knex.raw("CONCAT(??::TEXT, ' ', ?::TEXT)::INTERVAL", [value, unit]);
}

export function addSqlMinutes<Row extends object>(
  start: string,
  minutes: string
): Knex.Raw<Row> {
  return knex.raw("DATE_ADD(??, ??)", [
    start,
    asSqlInterval(minutes, "minutes"),
  ]);
}
