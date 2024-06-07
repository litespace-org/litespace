import {
  Pool,
  PoolClient,
  QueryConfigValues,
  QueryResult,
  QueryResultRow,
} from "pg";
import init from "knex";

import { databaseConnection } from "@/constants";

export const pool = new Pool(databaseConnection);

export async function query<T extends QueryResultRow, V extends unknown[]>(
  query: string,
  values?: QueryConfigValues<V>
): Promise<QueryResult<T>> {
  return await pool.query(query, values);
}

export async function withClient<T>(
  handler: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  handler: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export const knex = init({ client: "pg", connection: databaseConnection });
