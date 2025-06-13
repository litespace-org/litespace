import { Env, IToken } from "@litespace/types";
import { price } from "@litespace/utils/value";
import { unionOfLiterals } from "@/validation/utils";
import zod from "zod";

export const environment = unionOfLiterals<Env.Server>([
  "local",
  "staging",
  "production",
]).parse(process.env.ENVIRONMENT);

export const isDev = environment === "local";
export const isStaging = environment === "staging";
export const isProduction = environment === "production";

const schema = {
  string: zod.string().trim(),
  number: zod.coerce.number().nonnegative(),
} as const;

export const paginationDefaults = {
  page: 1,
  size: 10,
} as const;

export const databaseConnection = {
  user: schema.string.parse(process.env.PG_USER),
  password: schema.string.parse(process.env.PG_PASSWORD),
  host: schema.string.parse(process.env.PG_HOST),
  port: zod.coerce.number().parse(process.env.PG_PORT),
  database: schema.string.parse(process.env.PG_DATABASE),
  url: zod
    .string({ message: "Missing or invalid database url" })
    .startsWith("postgres://")
    .parse(process.env.DATABASE_URL),
} as const;

export const redisUrl = zod
  .string({ message: "Missing or invalid redis url" })
  .startsWith("redis://")
  .parse(process.env.REDIS_URL);

// Server
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

export enum FileType {
  Image = "image",
  Video = "video",
}

export const serverConfig = {
  port: SERVER_PORT ? schema.number.parse(SERVER_PORT) : 4000,
  host: SERVER_HOST ? schema.string.parse(SERVER_HOST) : "127.0.0.1",
  /**
   * @deprecated should be removed
   */
  assets: {
    directory: {
      uploads: "assets/uploads/",
      receipts: "assets/receipts/",
    },
    supported: {
      [FileType.Image]: ["image/png", "image/jpeg"],
      [FileType.Video]: ["video/webm", "video/mp4"],
    },
  },
  build: __dirname,
} as const;

export const jwtSecret = zod
  .string({ message: "Missing JWT Scret" })
  .parse(process.env.JWT_SECRET)
  .trim();

export const googleConfig = {
  clientId: zod
    .string({ message: "Missing or invalid google client id" })
    .trim()
    .parse(process.env.GOOGLE_CLIENT_ID),
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

export const spaceConfig = {
  bucketName: zod
    .string({ message: "Missing or invalid digital ocean space bucket name" })
    .trim()
    .parse(process.env.SPACES_BUCKET_NAME),
  accessKeyId: zod
    .string({ message: "Missing or invalid digital ocean space access key" })
    .trim()
    .parse(process.env.SPACES_ACCESS_KEY),
  secretAccessKey: zod
    .string({ message: "Missing or invalid digital ocean space secret key" })
    .trim()
    .parse(process.env.SPACES_SECRET_ACCESS_KEY),
} as const;

export const platformConfig = {
  /**
   * Tutor hourly rate scaled in EGP price (scaled).
   */
  tutorHourlyRate: price.scale(150),
  /**
   * Tutor interview duration in minutes
   */
  interviewDuration: 30,
};

export const MAX_FULL_FLAG_DAYS = 14;

export const tokensExpireTime = {
  [IToken.Type.VerifyEmail]: "24h",
  [IToken.Type.ForgetPassword]: "30m",
} as const;

export const telegramConfig = {
  token: zod
    .string({ message: "Missing telegram token" })
    .trim()
    .parse(process.env.TELEGRAM_TOKEN),

  chat: zod
    .number({ message: "Missing telegram chat id" })
    .parse(Number(process.env.TELEGRAM_CHAT)),
};

export const fawryConfig = {
  merchantCode: zod.string().parse(process.env.FAWRY_MERCHANT_CODE),
  secureKey: zod.string().parse(process.env.FAWRY_SECURE_KEY),
};

export const messengerConfig = {
  username: zod
    .string({ message: "Missing messenger username" })
    .trim()
    .parse(process.env.MESSENGER_USERNAME),
  password: zod
    .string({ message: "Missing messenger password" })
    .trim()
    .parse(process.env.MESSENGER_PASSWORD),
};

export const livekitConfig = {
  apiKey: zod
    .string({ message: "missing or invalid livekit api key" })
    .trim()
    .parse(process.env.LIVEKIT_API_KEY),
  apiSecret: zod
    .string({ message: "missing or invalid livekit api secret" })
    .trim()
    .parse(process.env.LIVEKIT_API_SECRET),
};
