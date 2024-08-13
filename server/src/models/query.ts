import { Pool, QueryConfigValues, QueryResult, QueryResultRow } from "pg";
import init, { Knex } from "knex";
import zod from "zod";

import { databaseConnection } from "@/constants";
import { IFilter } from "@litespace/types";

export const pool = new Pool(databaseConnection);

export const knex = init({ client: "pg", connection: databaseConnection });

export async function query<T extends QueryResultRow, V extends unknown[]>(
  query: string,
  values?: QueryConfigValues<V>
): Promise<QueryResult<T>> {
  return await pool.query(query, values);
}

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
    const defs = filter?.order?.map((column, index) => {
      const direction =
        filter?.direction?.[index] ||
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
