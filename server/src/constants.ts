import zod from "zod";

export enum Environment {
  Development = "development",
  Staging = "staging",
  Production = "production",
}

export const environment = zod
  .enum(
    [Environment.Development, Environment.Staging, Environment.Production],
    { message: "Missing server environment" }
  )
  .parse(process.env.ENVIRONMENT);

export const isDev = environment === Environment.Development;
export const isStaging = environment === Environment.Staging;
export const isProduction = environment === Environment.Production;

const schema = {
  string: zod.string().trim(),
  number: zod.coerce.number().nonnegative(),
} as const;

export const databaseConnection = {
  user: isDev ? "postgres" : schema.string.parse(process.env.PG_USER),
  password: isDev ? "litespace" : schema.string.parse(process.env.PG_PASSWORD),
  host: isDev ? "localhost" : schema.string.parse(process.env.PG_HOST),
  port: isDev ? 5432 : schema.number.parse(process.env.PG_PORT),
  database: isDev ? "litespace" : schema.string.parse(process.env.PG_DATABASE),
  url: zod
    .string({ message: "Missing or invalid database url" })
    .startsWith("postgres://")
    .parse(process.env.DATABASE_URL),
} as const;

// Server
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

export const serverConfig = {
  port: SERVER_PORT ? schema.number.parse(SERVER_PORT) : 8080,
  host: SERVER_HOST ? schema.string.parse(SERVER_HOST) : "0.0.0.0",
  origin: ["http://localhost:5173", "http://localhost:3001"],
} as const;

export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

export const authorizationSecret = zod
  .string({ message: "Missing JWT Scret" })
  .parse(process.env.JWT_SECRET)
  .trim();

export const googleConfig = {
  clientId: zod
    .string({ message: "Missing or invalid google client id" })
    .trim()
    .parse(process.env.GOOGLE_CLIENT_ID),
  clientSecret: zod
    .string({ message: "Missing or invalid google client secret" })
    .trim()
    .parse(process.env.GOOGLE_CLIENT_SECRET),
} as const;

export const facebookConfig = {
  appId: zod
    .string({ message: "Missing or invalid facebook app id" })
    .trim()
    .parse(process.env.FACEBOOK_APP_ID),
  appSecret: zod
    .string({ message: "Missing or invalid facebook app secret" })
    .trim()
    .parse(process.env.FACEBOOK_APP_SECRET),
} as const;

export const discordConfig = {
  clientId: zod
    .string({ message: "Missing or invalid discord client id" })
    .trim()
    .parse(process.env.DISCORD_CLIENT_ID),
  clientSecret: zod
    .string({ message: "Missing or invalid discord client secret" })
    .trim()
    .parse(process.env.DISCORD_CLIENT_SECRET),
  tokenApi: "https://discord.com/api/v10/oauth2/token",
  api: "https://discord.com/api/v10",
} as const;

export const emailConfig = {
  email: zod
    .string({ message: "Missing or invalid email" })
    .email({ message: "Invalid email" })
    .parse(process.env.EMAIL),
  password: zod
    .string({ message: "Missing or invalid password" })
    .parse(process.env.EMAIL_PASSWORD),
} as const;
