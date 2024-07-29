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

export function withFilter<T extends Knex.QueryBuilder>({
  builder,
  filter,
  defaults,
}: {
  builder: T;
  filter?: IFilter.Self;
  defaults?: {
    limit?: number;
    select?: string | string[];
    order?: IFilter.OrderDirection;
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

  builder.select(filter?.select || defaults?.select || "*");

  return builder;
}

export const knex = init({ client: "pg", connection: databaseConnection });
