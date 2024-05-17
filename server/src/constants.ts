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

const SERVER_PORT = process.env.SERVER_PORT;

export const serverConfig = {
  port: SERVER_PORT ? schema.number.parse(SERVER_PORT) : 8080,
} as const;

export const zoomConfig = {
  accountId: zod
    .string({ message: "Missing zoom account id" })
    .parse(process.env.ZOOM_ACCOUNT_ID),
  clientId: zod
    .string({ message: "Missing zoom client id" })
    .parse(process.env.ZOOM_CLIENT_ID),
  clientSecret: zod
    .string({ message: "Missing zoom client secret" })
    .parse(process.env.ZOOM_CLIENT_SECRET),
  tokenApi: "https://zoom.us/oauth/token",
  zoomApi: "https://api.zoom.us/v2/",
} as const;

export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

export const authorizationSecret = zod
  .string({ message: "Missing JWT Scret" })
  .parse(process.env.JWT_SECRET)
  .trim();
