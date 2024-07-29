import {
  Pool,
  PoolClient,
  QueryConfigValues,
  QueryResult,
  QueryResultRow,
} from "pg";
import init, { Knex } from "knex";

import { databaseConnection } from "@/constants";
import { IFilter } from "@litespace/types";

export const pool = new Pool(databaseConnection);

export async function query<T extends QueryResultRow, V extends unknown[]>(
  query: string,
  values?: QueryConfigValues<V>
): Promise<QueryResult<T>> {
  return await pool.query(query, values);
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
      columns?: string[];
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
      const term = asSearchTerm(filter.search, match);
      if (sensitive) builder.orWhereLike(column, term);
      else builder.orWhereILike(column, term);
    }
  }

  return builder;
}

export const knex = init({ client: "pg", connection: databaseConnection });
