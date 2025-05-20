import { Env } from "@litespace/types";
import zod from "zod";
import { unionOfLiterals } from "@/lib/utils";

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

// Server
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

export const serverConfig = {
  port: SERVER_PORT ? schema.number.parse(SERVER_PORT) : 4000,
  host: SERVER_HOST ? schema.string.parse(SERVER_HOST) : "127.0.0.1",
} as const;

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

export const jwtSecret = zod
  .string({ message: "Missing JWT Scret" })
  .parse(process.env.JWT_SECRET)
  .trim();

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
