import { Pool, QueryConfigValues, QueryResult, QueryResultRow } from "pg";

import { databaseConnection } from "../constants";

const pool = new Pool({ ...databaseConnection });

export async function query<T extends QueryResultRow, V extends unknown[]>(
  query: string,
  values?: QueryConfigValues<V>
): Promise<QueryResult<T>> {
  return await pool.query(query, values);
}
