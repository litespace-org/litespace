import zod from "zod";

export type Environment = "production" | "staging" | "development";
export const environment = process.env.ENVIRONMENT as Environment;
export const isProduction = environment === "production";
export const isStaging = environment === "staging";
export const isDev = environment === "development";

const schema = {
  string: zod.string().trim(),
  number: zod.coerce.number().nonnegative(),
} as const;

export const databaseConnection = {
  user: isDev ? "postgres" : schema.string.parse(process.env.PG_USER),
  password: isDev ? "space" : schema.string.parse(process.env.PG_PASSWORD),
  host: isDev ? "localhost" : schema.string.parse(process.env.PG_HOST),
  port: isDev ? 5432 : schema.number.parse(process.env.PG_PORT),
  database: isDev ? "space" : schema.string.parse(process.env.PG_DATABASE),
} as const;
