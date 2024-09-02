import { Pool, QueryConfigValues, QueryResult, QueryResultRow } from "pg";
import init, { Knex } from "knex";
import zod from "zod";

import { IFilter } from "@litespace/types";

const connection = {
  user: zod.string().parse(process.env.PG_USER),
  password: zod.string().parse(process.env.PG_PASSWORD),
  host: zod.string().parse(process.env.PG_HOST),
  port: zod.coerce.number().parse(process.env.PG_PORT),
  database: zod.string().parse(process.env.PG_DATABASE),
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
  if (filter?.page) {
    const limit = filter?.size || defaults?.limit || 10;
    const offset = limit * (filter.page - 1);
    builder.offset(offset).limit(limit);
  }

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

export async function count(table: string): Promise<number> {
  const { count } = await knex(table)
    .count("id AS count")
    .first<{ count: string }>();
  return zod.coerce.number().parse(count);
}

export function column<T>(value: keyof T, table: string | null = null): string {
  if (!table) return value.toString();
  return `${table}.${value.toString()}`;
}

export function aggArrayOrder(column: string) {
  return `array_agg(${column} order by ${column}) = ?` as const;
}
