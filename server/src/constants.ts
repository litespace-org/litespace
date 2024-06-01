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
  password: isDev ? "litespace" : schema.string.parse(process.env.PG_PASSWORD),
  host: isDev ? "localhost" : schema.string.parse(process.env.PG_HOST),
  port: isDev ? 5432 : schema.number.parse(process.env.PG_PORT),
  database: isDev ? "litespace" : schema.string.parse(process.env.PG_DATABASE),
} as const;

// Server
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

export const serverConfig = {
  port: SERVER_PORT ? schema.number.parse(SERVER_PORT) : 8080,
  host: SERVER_HOST ? schema.string.parse(SERVER_HOST) : "localhost",
  client: zod.string().url().parse(process.env.CLIENT_URL),
} as const;

// Zoom
export enum ZoomAppType {
  ServerBased = "server-to-server",
  UserBased = "user-app",
}

export const zoomConfig = {
  tokenApi: "https://zoom.us/oauth/token",
  zoomApi: "https://api.zoom.us/v2/",
  appType: zod
    .enum([ZoomAppType.ServerBased, ZoomAppType.UserBased], {
      message: "Invalid zoom app type",
    })
    .parse(process.env.ZOOM_APP_TYPE),
  appsCount: zod.coerce
    .number({ message: "Invalid zoom apps count" })
    .positive({ message: "Invalid zoom apps count" })
    .parse(process.env.ZOOM_APPS_COUNT),
} as const;

export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

export const authorizationSecret = zod
  .string({ message: "Missing JWT Scret" })
  .parse(process.env.JWT_SECRET)
  .trim();

export const googleConfig = {
  clientId: zod.string().trim().parse(process.env.GOOGLE_CLIENT_ID),
  clientSecret: zod.string().trim().parse(process.env.GOOGLE_CLIENT_SECRET),
} as const;

export const facebookConfig = {
  appId: zod.string().trim().parse(process.env.FACEBOOK_APP_ID),
  appSecret: zod.string().trim().parse(process.env.FACEBOOK_APP_SECRET),
} as const;

export const discordConfig = {
  clientId: zod.string().trim().parse(process.env.DISCORD_CLIENT_ID),
  clientSecret: zod.string().trim().parse(process.env.DISCORD_CLIENT_SECRET),
  tokenApi: "https://discord.com/api/v10/oauth2/token",
  api: "https://discord.com/api/v10",
} as const;
